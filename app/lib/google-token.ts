import {createRemoteJWKSet,jwtVerify,type JWTVerifyGetKey} from 'jose';
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export async function verifyGoogleCredential(token:string,clientId:string,nonce:string,key:JWTVerifyGetKey=keys){
 const {payload:p}=await jwtVerify(token,key,{algorithms:['RS256'],issuer:['accounts.google.com','https://accounts.google.com'],audience:clientId,requiredClaims:['sub','iat','exp','email','email_verified','nonce'],maxTokenAge:'10m'});
 if(p.nonce!==nonce||p.email_verified!==true||typeof p.sub!=='string'||!p.sub||typeof p.email!=='string'||p.email.length>254)throw new Error('Invalid identity');
 const email=p.email.toLowerCase();
 if(!email.endsWith('@gmail.com')&&!(typeof p.hd==='string'&&p.hd&&email.endsWith('@'+p.hd.toLowerCase())))throw new Error('Use Gmail or verified Workspace');
 if(p.azp!==undefined&&p.azp!==clientId)throw new Error('Invalid authorized party');
 return {subject:p.sub,email,name:typeof p.name==='string'?p.name.slice(0,100):email};
}
export async function hashToken(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('');}
export function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');}
