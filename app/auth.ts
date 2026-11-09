import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {env} from 'cloudflare:workers';
import {getChatGPTUser,type ChatGPTUser} from './chatgpt-auth';
import {hashToken} from './lib/google-token';
export const SESSION_COOKIE='__Host-bk-session',CHALLENGE_COOKIE='__Host-bk-google';
export const cookieOptions={httpOnly:true,secure:true,sameSite:'lax' as const,path:'/'};
export async function getUser():Promise<ChatGPTUser|null>{
 const token=(await cookies()).get(SESSION_COOKIE)?.value;
 if(token){
  if(!/^[a-f0-9]{64}$/.test(token)||!env.DB)return null;
  const u=await env.DB.prepare('SELECT u.* FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.blocked=0').bind(await hashToken(token),Date.now()).first<any>();
  return u?{userId:u.id,email:u.email,displayName:u.name,fullName:u.name}:null;
 }
 // Preserve trusted Sites identity solely for existing users and administrator migration.
 return getChatGPTUser();
}
export async function requireUser(){const user=await getUser();if(!user)redirect('/login');return user;}
