import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {SESSION_COOKIE,CHALLENGE_COOKIE,cookieOptions} from '../../../auth';
import {hashToken} from '../../../lib/google-token';
import {getChatGPTUser,chatGPTSignOutPath} from '../../../chatgpt-auth';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Permintaan ditolak.'},{status:403});
 const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value;
 if(token&&!env.DB)return Response.json({error:'Layanan belum tersedia.'},{status:503});
 if(token&&/^[a-f0-9]{64}$/.test(token))await env.DB!.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await hashToken(token)).run();
 jar.set(SESSION_COOKIE,'',{...cookieOptions,maxAge:0});jar.set(CHALLENGE_COOKIE,'',{...cookieOptions,maxAge:0});
 return Response.json({next:await getChatGPTUser()?chatGPTSignOutPath('/login'):'/login'},{headers:{'Cache-Control':'no-store'}});
}
