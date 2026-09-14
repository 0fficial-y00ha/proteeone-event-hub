import {settlement, type EventPlan} from './event-model.ts';

export const divide=(n:number|null,d:number|null)=>n==null||!d?null:n/d;
export function salesLine(l:EventPlan['lines'][number],plan:EventPlan){
 const s=l.price==null?null:settlement(l.price,plan.blocks[l.block]);
 const Q=l.settingPrice??s?.setting??null,R=l.channelDiscount??s?.channelDiscount??null,S=l.ownDiscount??s?.ownDiscount??null,T=l.price,U=l.cost,V=l.planned,AB=l.actual;
 const multiply=(v:number|null,q:number|null)=>q===0?0:v==null||q==null?null:v*q;
 const discount=R==null||S==null?null:R+S;
 return {Q,R,S,T,U,V,AB,X:multiply(Q,V),Y:multiply(discount,V),Z:multiply(T,V),AA:multiply(U,V),AC:multiply(Q,AB),AD:multiply(discount,AB),AE:multiply(T,AB),AF:multiply(U,AB)};
}
export function workbookProfit(plan:EventPlan){
 const lines=plan.lines.filter(l=>l.source==='스킴 선택'),detail=lines.map(l=>salesLine(l,plan));
 const sum=(key:keyof ReturnType<typeof salesLine>)=>detail.some(d=>d[key]==null)?null:detail.reduce((s,d)=>s+(d[key]??0),0);
 const primary=lines[0],block=plan.blocks[primary?.block??0],price=primary?.basePrice??primary?.price;
 const setting=price==null?null:settlement(price,block),effective=setting&&price?(setting.fee-setting.ownDiscount)/price:null;
 const targetQty=plan.targetQty;
 const evaluate=(actual:boolean)=>{
  const v:Record<string,number|null>={};
  const sub=(x:number|null,y:number|null)=>x==null||y==null?null:x-y;
  v.qty=actual?sum('AB'):targetQty;
  v.setting=actual?sum('AC'):setting?setting.setting*targetQty:null;
  v.discount=sum(actual?'AD':'Y');
  v.channel=v.discount==null?null:v.discount*(1-block.share);
  v.own=sub(v.discount,v.channel);
  v.revenue=actual?sum('AE'):sub(v.setting,v.discount);
  v.sales=sub(v.setting,v.own);v.cost=sum(actual?'AF':'AA');v.costRate=divide(v.cost,v.sales);
  v.gross=sub(v.sales,v.cost);v.grossRate=divide(v.gross,v.sales);
  v.fee=effective==null||v.revenue==null?null:effective*v.revenue;
  v.shipping=v.qty==null?null:2860*v.qty;v.logistics=v.qty==null?null:(469+33)*v.qty;
  v.adRate=(actual?plan.actualAdRate:plan.targetAdRate)??.05;
  v.ad=v.sales==null?null:v.sales*v.adRate;
  v.profit=[v.gross,v.fee,v.shipping,v.logistics,v.ad].some(x=>x==null)?null:v.gross!-v.fee!-v.shipping!-v.logistics!-v.ad!;
  v.profitRate=divide(v.profit,v.sales);return v;
 };
 const target=evaluate(false),actual=evaluate(true);
 return {target,actual,detail,plannedQty:sum('V'),actualQty:sum('AB'),invoiceAverage:divide(actual.setting,plan.invoiceCount??0),targetTraffic:divide(targetQty,plan.targetConversion??0)};
}
