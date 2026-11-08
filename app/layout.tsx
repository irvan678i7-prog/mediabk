import './globals.css';
import FeedbackProvider from './ui-feedback';
export const metadata={title:'Ruang Main BK — Media Interaktif',description:'Temukan aktivitas bermakna untuk kelas BK. Media pribadi, sosial, belajar, dan karier yang dipandu guru.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="id"><body><FeedbackProvider>{children}</FeedbackProvider></body></html>}
