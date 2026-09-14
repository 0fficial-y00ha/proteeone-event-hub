export type MediaRecord={name:string,budget:number|null,targetTraffic:number|null,spent:number|null,actualTraffic:number|null,source:string};
export type PastEvent={id:string,channel:string,title:string,start:string,end:string,targetRevenue?:number|null,revenue:number|null,qty:number|null,profit:number|null,margin:number|null,roas:number|null,conversion:number|null,source:string,media:MediaRecord[],dataIssues?:string[]};
export function normalizeChannel(v:string){const s=v.toLowerCase().replace(/\s/g,'');return ({'g마켓':'지마켓','gmarket':'지마켓','29cm':'29cm','카카오톡스토어':'카카오톡딜','올리브영':'올리브영(온)'} as Record<string,string>)[s]??s}
export function eventIssues(e:PastEvent){const issues:string[]=[...(e.dataIssues??[])];if(!e.title||['시작일','종료일','행사명'].includes(e.title.trim()))issues.push('행사명이 원본에서 정확하게 확인되지 않습니다.');if(e.revenue==null)issues.push('매출 자료가 없습니다.');if(e.qty==null)issues.push('판매 수량 자료가 없습니다.');if(e.margin!=null&&Math.abs(e.margin)>1)issues.push('공헌이익률의 단위를 확인해야 합니다.');if(e.margin==null)issues.push('공헌이익률 원본을 확인해야 합니다.');if(e.profit==null)issues.push('공헌이익 원본 합계를 확인해야 합니다.');if(e.revenue&&e.qty===0)issues.push('매출이 있지만 판매 수량은 0입니다.');if(!e.media.length)issues.push('매체별 광고비와 트래픽 기록이 없습니다.');return issues}
function normalizeMedia(v:string){const s=v.replace(/\s/g,'');return ({브검:'브랜드검색',모먼트:'카카오모먼트',카카오모먼트:'카카오모먼트',SA:'SA/CPC'} as Record<string,string>)[s]??s}
export function recommendMedia(events:PastEvent[],channel:string,before:string){
 const seen=new Set<string>();
 const matching=events.filter(e=>e.channel&&e.start&&normalizeChannel(e.channel)===normalizeChannel(channel)&&e.start.slice(0,10)<before).sort((a,b)=>b.start.localeCompare(a.start)).filter(e=>{const k=`${e.start}|${e.end}|${e.title}`;if(seen.has(k))return false;seen.add(k);return true});
 const groups=new Map<string,{event:PastEvent,record:MediaRecord,kind:'actual'|'planned',cost:number,traffic:number}[]>();
 for(const e of matching)for(const m of e.media){
  const actual=m.spent!=null&&m.spent>0&&m.actualTraffic!=null&&m.actualTraffic>0;
  const planned=m.budget!=null&&m.budget>0&&m.targetTraffic!=null&&m.targetTraffic>0;
  if(!actual&&!planned)continue;
  const name=normalizeMedia(m.name);const records=groups.get(name)??[];
  records.push({event:e,record:m,kind:actual?'actual':'planned',cost:actual?m.spent!:m.budget!,traffic:actual?m.actualTraffic!:m.targetTraffic!});groups.set(name,records);
 }
 const recommendations=[...groups].map(([name,records])=>{
  const actual=records.filter(r=>r.kind==='actual'),sample=(actual.length?actual:records).slice(0,12);
  const cost=sample.reduce((s,r)=>s+r.cost,0),traffic=sample.reduce((s,r)=>s+r.traffic,0),cpcs=sample.map(r=>r.cost/r.traffic);
  return {name,expectedCpc:cost/traffic,minCpc:Math.min(...cpcs),maxCpc:Math.max(...cpcs),sampleCount:sample.length,basis:actual.length?'actual':'planned',
   reason:`동일 채널 ${sample.length}건의 ${actual.length?'실행 비용 ÷ 실제 트래픽':'계획 비용 ÷ 목표 트래픽'} 기준`,
   sources:sample.map(r=>({title:r.event.title,date:r.event.start,source:r.record.source,cost:r.cost,traffic:r.traffic})),
   metric:'traffic_cost'};
 }).sort((a,b)=>(a.basis===b.basis?0:a.basis==='actual'?-1:1)||a.expectedCpc-b.expectedCpc);
 return {recent:matching.slice(0,3).map(e=>({...e,title:!e.title||['시작일','종료일','행사명'].includes(e.title.trim())?e.source.split(' | ').at(-1)||'행사명 확인 필요':e.title,issues:eventIssues(e),margin:e.margin!=null&&Math.abs(e.margin)>1?null:e.margin})),recommendations,matchedEvents:matching.length,
  note:'과거 행사의 ROAS와 목표·실제 매출을 참고해 광고비와 트래픽 계획을 돕습니다.'};
}
