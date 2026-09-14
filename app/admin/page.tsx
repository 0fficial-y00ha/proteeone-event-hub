import {requireChatGPTUser} from '../chatgpt-auth';
import {companyRole} from '@/lib/access';
import {storage} from '@/lib/storage';
export const dynamic='force-dynamic';
export default async function Admin(){const user=await requireChatGPTUser('/admin');if(companyRole(user.email)!=='admin')return <main><h1>관리자 전용</h1><a href="/">돌아가기</a></main>;
 try{const rows=await storage().prepare("SELECT id,title,channel,owner,version,updated_at,json_extract(payload,'$.audit') AS audit FROM event_plans ORDER BY updated_at DESC LIMIT 100").all<{id:string,title:string,channel:string,owner:string,version:number,updated_at:string,audit:string}>();return <main style={{maxWidth:1100,margin:'40px auto',padding:24}}><a href="/">행사 관리</a><h1>관리자 · 변경 기록</h1><p>최근 수정 100건 · 일반 사용자는 본인 행사만 조회하고 편집할 수 있습니다.</p>{rows.results.map(r=><details key={r.id}><summary>{r.channel} · {r.title} · {r.updated_at}</summary><p>작성자 {r.owner} / 저장 {r.version}회</p>{(JSON.parse(r.audit||'[]') as {at:string,action:string,by:string}[]).map((a,i)=><p key={i}>{a.at} · {a.action} · {a.by}</p>)}</details>)}</main>}catch{return <main>관리 기록을 불러올 수 없습니다. <a href="/">돌아가기</a></main>}}
