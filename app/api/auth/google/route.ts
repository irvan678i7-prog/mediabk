import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {SESSION_COOKIE,CHALLENGE_COOKIE,cookieOptions} from '../../../auth';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {verifyGoogleCredential,hashToken,randomToken} from '../../../lib/google-token';
export const dynamic='force-dynamic';
const out=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const clientId=()=>String((env as any).GOOGLE_CLIENT_ID||'');
export async function GET(){
 if(!clientId())return out({error:'Login Google belum diaktifkan oleh pengelola.'},503);
 try{const db=env.DB;if(!db)throw new Error();const now=Date.now(),token=randomToken(),nonce=randomToken();
 await db.batch([db.prepare('DELETE FROM auth_challenges WHERE expires_at<=?').bind(now),db.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').bind(now),db.prepare('INSERT INTO auth_challenges(token_hash,nonce,expires_at) VALUES(?,?,?)').bind(await hashToken(token),nonce,now+600000)]);
 (await cookies()).set(CHALLENGE_COOKIE,token,{...cookieOptions,maxAge:600});return out({clientId:clientId(),nonce});
 }catch{return out({error:'Layanan masuk belum tersedia. Coba lagi sebentar.'},503);}
}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return out({error:'Permintaan tidak diizinkan.'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return out({error:'Format tidak didukung.'},415);
 if(!clientId())return out({error:'Login Google belum diaktifkan oleh pengelola.'},503);
 try{const db=env.DB;if(!db)throw new Error();const jar=await cookies(),challenge=jar.get(CHALLENGE_COOKIE)?.value;
 if(!challenge||!/^[a-f0-9]{64}$/.test(challenge))return out({error:'Sesi masuk kedaluwarsa. Silakan coba lagi.'},400);
 const raw=await req.text();if(raw.length>16000)return out({error:'Data terlalu besar.'},413);
 let body:any;try{body=JSON.parse(raw);}catch{return out({error:'Data tidak valid.'},400);}
 if(typeof body.credential!=='string'||body.credential.length>12000)return out({error:'Kredensial tidak valid.'},400);
 const saved=await db.prepare('DELETE FROM auth_challenges WHERE token_hash=? AND expires_at>? RETURNING nonce').bind(await hashToken(challenge),Date.now()).first<{nonce:string}>();
 jar.set(CHALLENGE_COOKIE,'',{...cookieOptions,maxAge:0});if(!saved)return out({error:'Sesi masuk sudah digunakan atau kedaluwarsa.'},400);
 let identity;try{identity=await verifyGoogleCredential(body.credential,clientId(),saved.nonce);}catch{return out({error:'Akun tidak dapat diverifikasi. Gunakan Gmail atau Google Workspace dan coba lagi.'},401);}
 let link=await db.prepare('SELECT user_id FROM google_identities WHERE subject=?').bind(identity.subject).first<{user_id:string}>();
 if(!link){
  const matches=(await db.prepare('SELECT id,role FROM users WHERE lower(email)=? LIMIT 2').bind(identity.email).all<any>()).results;
  if(matches.length>1)return out({error:'Email memiliki lebih dari satu akun. Hubungi admin.'},409);
  const previous=matches[0];
  if(previous?.role==='admin'){
   const legacy=await getChatGPTUser();
   if(!legacy||legacy.userId!==previous.id||legacy.email.toLowerCase()!==identity.email)return out({error:'Admin lama perlu menautkan Google dari sesi admin yang sudah masuk terlebih dahulu.'},409);
  }
  const id=previous?.id||'google:'+identity.subject;
  await db.batch([db.prepare("INSERT OR IGNORE INTO users(id,email,name,role,until,blocked) VALUES(?,?,?,'user',0,0)").bind(id,identity.email,identity.name),db.prepare('INSERT OR IGNORE INTO google_identities(subject,user_id) VALUES(?,?)').bind(identity.subject,id)]);
  link=await db.prepare('SELECT user_id FROM google_identities WHERE subject=?').bind(identity.subject).first<{user_id:string}>();
 }
 if(!link)throw new Error();
 const user=await db.prepare('SELECT blocked FROM users WHERE id=?').bind(link.user_id).first<{blocked:number}>();
 if(!user||user.blocked)return out({error:'Akun dinonaktifkan. Hubungi admin.'},403);
 const old=jar.get(SESSION_COOKIE)?.value;if(old&&/^[a-f0-9]{64}$/.test(old))await db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await hashToken(old)).run();
 const token=randomToken();await db.prepare('INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await hashToken(token),link.user_id,Date.now()+7*86400000).run();
 jar.set(SESSION_COOKIE,token,{...cookieOptions,maxAge:7*86400});return out({ok:true});
 }catch{return out({error:'Belum berhasil masuk. Silakan coba lagi.'},503);}
}
