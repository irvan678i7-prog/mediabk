"use client";
import {useState} from 'react';
import {LogOut} from 'lucide-react';
export default function LogoutButton(){const[busy,setBusy]=useState(false),[error,setError]=useState('');return <span><button className="iconbtn" title="Keluar" aria-label="Keluar" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const r=await fetch('/api/auth/logout',{method:'POST'});if(!r.ok)throw new Error();const data=await r.json() as {next:string};window.location.assign(data.next);}catch{setError('Gagal keluar. Coba lagi.');setBusy(false);}}}><LogOut size={16}/></button>{error&&<small role="alert">{error}</small>}</span>}
