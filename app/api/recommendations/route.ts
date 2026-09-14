import {getChatGPTUser} from '../../chatgpt-auth';
import {eventHistory} from '@/lib/history';
import {recommendMedia} from '@/lib/media-recommendations';
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 const params=new URL(request.url).searchParams,channel=params.get('channel')??'',before=params.get('before')??'';
 if(!channel||channel.length>100||!/^\d{4}-\d{2}-\d{2}$/.test(before))return Response.json({error:'채널과 기준일을 확인하세요.'},{status:400});
 try{return Response.json(recommendMedia(await eventHistory(user.userId),channel,before),{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({error:'과거 행사 기록을 불러올 수 없습니다.'},{status:503})}
}
