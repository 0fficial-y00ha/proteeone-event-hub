import {getChatGPTUser} from '../../chatgpt-auth';
import {storage} from '@/lib/storage';
import {eventSchema,settlement} from '@/lib/event-model';
import {workbookProfit} from '@/lib/workbook-calculations';
import {recommendMedia} from '@/lib/media-recommendations';
import {eventHistory} from '@/lib/history';
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try{const id=new URL(request.url).searchParams.get('id');const db=storage();
 if(id){const row=await db.prepare('SELECT payload,version FROM event_plans WHERE id=? AND owner=?').bind(id,user.userId).first<{payload:string,version:number}>();return row?Response.json({...JSON.parse(row.payload),version:row.version},{headers:{'Cache-Control':'private, no-store'}}):Response.json({error:'행사를 찾을 수 없습니다.'},{status:404});}
 const rows=await db.prepare("SELECT id,title,channel,version,updated_at,json_extract(payload,'$.start') AS start,json_extract(payload,'$.end') AS end,json_extract(payload,'$.status') AS status,json_extract(payload,'$.calculated.actual.revenue') AS revenue,json_extract(payload,'$.calculated.actual.profitRate') AS margin FROM event_plans WHERE owner=? ORDER BY updated_at DESC LIMIT 100").bind(user.userId).all();return Response.json(rows.results,{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){console.error(error);return Response.json({error:'저장된 행사를 불러올 수 없습니다. 잠시 후 다시 시도하세요.'},{status:503});}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});
 try{
 const raw=await request.text();if(raw.length>300000)return Response.json({error:'행사 내용이 너무 큽니다.'},{status:413});
 let input;try{input=JSON.parse(raw)}catch{return Response.json({error:'입력 형식이 올바르지 않습니다.'},{status:400})}
 const parsed=eventSchema.safeParse(input);if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400});
 const e=parsed.data,db=storage(),updated=new Date().toISOString();
 e.media=e.media.map(m=>m.expectedCpc===undefined?m:{...m,target:m.expectedCpc>0?Math.floor(m.budget/m.expectedCpc):0});
 const row=e.version?await db.prepare('SELECT payload,version FROM event_plans WHERE id=? AND owner=?').bind(e.id,user.userId).first<{payload:string,version:number}>():null;
 const previous=row?JSON.parse(row.payload):null;
 if(previous?.status==='완료')return Response.json({error:'확정된 행사는 당시 값을 보존합니다. 복사하여 새 행사로 편집하세요.'},{status:409});
 const chosen=e.lines.filter(l=>l.source==='스킴 선택');
 if(e.status==='완료'&&(!chosen.length||chosen.some(l=>l.price==null||l.cost==null)))return Response.json({error:'가격과 원가가 확인된 구성을 하나 이상 저장한 뒤 확정하세요. 예상 수량은 선택 입력입니다.'},{status:400});
 const calculated=workbookProfit(e),pricing=chosen.map(l=>({group:l.group,option:l.option,price:l.price,cost:l.cost,conditions:e.blocks[l.block],result:l.price==null?null:settlement(l.price,e.blocks[l.block])}));
 const payload={...e,calculationVersion:'0831-v2',calculated,pricing,updatedAt:updated,updatedBy:user.userId,
 audit:[...(previous?.audit??[]),{version:e.version+1,at:updated,by:user.userId,action:e.status==='완료'?'확정':e.version?'수정':'생성'}],
 snapshot:e.status==='완료'?{at:updated,plan:e,pricing,calculated,benchmark:recommendMedia(await eventHistory(user.userId),e.channel,e.start)}:null};
 // One SQLite statement atomically stores the full aggregate, audit and snapshot.
 const result=e.version===0?await db.prepare('INSERT OR IGNORE INTO event_plans(id,owner,title,channel,payload,version,updated_at) VALUES(?,?,?,?,?,1,?)').bind(e.id,user.userId,e.title,e.channel,JSON.stringify(payload),updated).run():await db.prepare('UPDATE event_plans SET title=?,channel=?,payload=?,version=version+1,updated_at=? WHERE id=? AND owner=? AND version=?').bind(e.title,e.channel,JSON.stringify(payload),updated,e.id,user.userId,e.version).run();
 if(!result.meta.changes)return Response.json({error:'다른 창에서 수정된 행사입니다. 다시 불러온 뒤 편집하세요.'},{status:409});
 return Response.json({version:e.version+1,updatedAt:updated,status:e.status,snapshot:payload.snapshot,audit:payload.audit});
 }catch(error){console.error(error);return Response.json({error:'저장하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도하세요.'},{status:503});}
}
