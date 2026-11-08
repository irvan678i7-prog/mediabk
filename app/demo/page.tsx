'use client';
import {useEffect,useState} from 'react';
import {Player} from '../portal';
import {catalog} from '../lib/media-public';
export default function Demo(){const [game,setGame]=useState<any>(null),[error,setError]=useState('');useEffect(()=>{fetch('/api/portal?media=emosi').then(async r=>{const d:any=await r.json();if(!r.ok)throw new Error(d.error);setGame({...catalog[0],...d})}).catch(e=>setError(e.message))},[]);return game?<Player game={game} onExit={()=>location.assign('/login')}/>:<main className="playersetup"><h1>{error||'Menyiapkan permainan…'}</h1><a href="/login">Kembali ke login</a></main>}
