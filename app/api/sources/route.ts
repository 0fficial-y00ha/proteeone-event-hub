import {storage} from '@/lib/storage';
import {readDataJson} from '@/lib/r2-data';
import {getChatGPTUser} from '../../chatgpt-auth';

export async function GET(request:Request){
 if(!await getChatGPTUser())return Response.json({error:'로그인이 필요합니다.'},{status:401});
 const id=new URL(request.url).searchParams.get('id');
 if(!id)return Response.json(await readDataJson('archive.json'));
 if(!/^(base|[a-f0-9]{16})$/.test(id))return Response.json({error:'잘못된 원본 ID입니다.'},{status:400});
 try{const db=storage();let row=await db.prepare('SELECT payload FROM source_sheets WHERE id=?').bind(id).first<{payload:string}>();if(!row){const payload=await readDataJson<unknown>(`${id}.json`);const json=JSON.stringify(payload);await db.prepare('INSERT OR IGNORE INTO source_sheets(id,payload) VALUES(?,?)').bind(id,json).run();row={payload:json};}return new Response(row.payload,{headers:{'Content-Type':'application/json; charset=utf-8'}});}catch(error){console.error(error);return Response.json({error:'원본 DB 또는 R2 데이터를 불러올 수 없습니다. 다시 시도하세요.'},{status:503});}
}
