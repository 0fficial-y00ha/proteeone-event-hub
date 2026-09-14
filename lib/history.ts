import {storage} from './storage';
import {readDataJson} from './r2-data';
import type {PastEvent} from './media-recommendations';
export async function eventHistory(owner:string):Promise<PastEvent[]>{
 const archive=await readDataJson<{events:PastEvent[]}>('event-history.json');
 const rows=await storage().prepare("SELECT id,title,channel,payload FROM event_plans WHERE owner=? AND json_extract(payload,'$.status')='완료' ORDER BY updated_at DESC LIMIT 100").bind(owner).all<{id:string,title:string,channel:string,payload:string}>();
 const saved=rows.results.map(r=>{const e=JSON.parse(r.payload),a=e.calculated?.actual,t=e.calculated?.target;return {id:r.id,title:r.title,channel:r.channel,start:e.start,end:e.end,targetRevenue:t?.revenue??null,revenue:a?.revenue??null,qty:a?.qty??null,profit:a?.profit??null,margin:a?.profitRate??null,roas:e.media.reduce((s:number,m:any)=>s+m.spent,0)>0&&a?.revenue!=null?a.revenue/e.media.reduce((s:number,m:any)=>s+m.spent,0):null,conversion:e.actualConversion??null,source:'웹 확정 스냅샷 · '+r.id,media:e.media.map((m:any)=>({name:m.name,budget:m.budget,targetTraffic:m.target,spent:m.spent,actualTraffic:m.actual,source:'웹 확정 스냅샷 · '+r.id}))} as PastEvent});
 return [...saved,...archive.events as PastEvent[]];
}
