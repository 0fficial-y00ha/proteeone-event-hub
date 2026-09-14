import {getChatGPTUser} from '../../chatgpt-auth';
import {companyRole} from '@/lib/access';
import {storage} from '@/lib/storage';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 if(companyRole(user.email)!=='admin')return Response.json({error:'관리자 전용입니다.'},{status:403});
 try{const result=await storage().prepare("SELECT id,title,channel,owner,version,updated_at,json_extract(payload,'$.status') AS status,json_extract(payload,'$.audit') AS audit FROM event_plans ORDER BY updated_at DESC LIMIT 100").all();return Response.json({events:result.results},{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({error:'관리 기록을 조회할 수 없습니다.'},{status:503})}
}
