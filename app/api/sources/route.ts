import {storage} from '@/lib/storage';
import {getChatGPTUser} from '../../chatgpt-auth';
import archive from '../../../data/archive.json';
// Immutable workbook values; cached in D1 on first access, never executed as instructions.
const sources=import.meta.glob('../../../data/*.json',{eager:true,import:'default'}) as Record<string,unknown>;
export async function GET(request:Request){
 if(!await getChatGPTUser())return Response.json({error:'로그인이 필요합니다.'},{status:401});
 const id=new URL(request.url).searchParams.get('id');if(!id)return Response.json(archive);
 if(!/^(base|[a-f0-9]{16})$/.test(id))return Response.json({error:'잘못된 원본 ID입니다.'},{status:400});
 const payload=sources['../../../data/'+id+'.json'];if(!payload)return Response.json({error:'원본이 없습니다.'},{status:404});
 try{const db=storage();let row=await db.prepare('SELECT payload FROM source_sheets WHERE id=?').bind(id).first<{payload:string}>();if(!row){const json=JSON.stringify(payload);await db.prepare('INSERT OR IGNORE INTO source_sheets(id,payload) VALUES(?,?)').bind(id,json).run();row={payload:json};}return new Response(row.payload,{headers:{'Content-Type':'application/json; charset=utf-8'}});}catch(error){console.error(error);return Response.json({error:'원본 DB를 불러올 수 없습니다. 다시 시도하세요.'},{status:503});}
}

