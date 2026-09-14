import {getChatGPTUser} from '../../chatgpt-auth';
import {eventSchema} from '@/lib/event-model';
import {workbookProfit} from '@/lib/workbook-calculations';
export async function POST(request:Request){
 if(!await getChatGPTUser())return Response.json({error:'로그인이 필요합니다.'},{status:401});
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});
 try{const body=await request.text();if(body.length>300000)return Response.json({error:'입력이 너무 큽니다.'},{status:413});const p=eventSchema.safeParse(JSON.parse(body));if(!p.success)return Response.json({error:p.error.issues[0].message},{status:400});return Response.json(workbookProfit(p.data));}catch{return Response.json({error:'입력 형식을 확인하세요.'},{status:400})}
}
