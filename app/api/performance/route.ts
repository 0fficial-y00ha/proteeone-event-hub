import {z} from 'zod';
import {getChatGPTUser} from '../../chatgpt-auth';
import {storage} from '@/lib/storage';
import {eventSchema} from '@/lib/event-model';
import {workbookProfit} from '@/lib/workbook-calculations';
const amount=z.number().finite().min(0).max(1e12);
const inputSchema=z.object({id:z.string().min(1).max(80),version:z.number().int().min(1),actual:z.array(amount.nullable()).max(200),invoiceCount:amount,actualTraffic:amount,actualConversion:z.number().min(0).max(1),actualAdRate:z.number().min(0).max(1),media:z.array(z.object({spent:amount,actual:amount})).max(30)}).strict();
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});
 try{const raw=await request.text();if(raw.length>50000)return Response.json({error:'요청이 너무 큽니다.'},{status:413});const parsed=inputSchema.safeParse(JSON.parse(raw));if(!parsed.success)return Response.json({error:'실적 입력값을 확인하세요.'},{status:400});const v=parsed.data,db=storage();
 const row=await db.prepare('SELECT payload,version FROM event_plans WHERE id=? AND owner=?').bind(v.id,user.userId).first<{payload:string,version:number}>();if(!row)return Response.json({error:'행사를 찾을 수 없습니다.'},{status:404});const saved=JSON.parse(row.payload),e=eventSchema.parse(saved);
 if(e.status!=='완료'||v.actual.length!==e.lines.length||v.media.length!==e.media.length)return Response.json({error:'확정된 구성에 맞춰 실적을 입력하세요.'},{status:400});
 const next={...e,invoiceCount:v.invoiceCount,actualTraffic:v.actualTraffic,actualConversion:v.actualConversion,actualAdRate:v.actualAdRate,lines:e.lines.map((l,i)=>({...l,actual:v.actual[i]})),media:e.media.map((m,i)=>({...m,...v.media[i]}))},at=new Date().toISOString();
 const payload={...saved,...next,calculated:workbookProfit(next),updatedAt:at,updatedBy:user.userId,audit:[...(saved.audit??[]),{version:v.version+1,at,by:user.userId,action:'실적 입력'}]};
 const result=await db.prepare('UPDATE event_plans SET payload=?,version=version+1,updated_at=? WHERE id=? AND owner=? AND version=?').bind(JSON.stringify(payload),at,v.id,user.userId,v.version).run();if(!result.meta.changes)return Response.json({error:'다른 창에서 수정되었습니다. 다시 불러오세요.'},{status:409});return Response.json({...payload,version:v.version+1});
 }catch{return Response.json({error:'실적을 저장하지 못했습니다. 입력 내용을 확인해 주세요.'},{status:400})}
}
