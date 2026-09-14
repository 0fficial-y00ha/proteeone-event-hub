import {z} from 'zod';
const money=z.number().finite().min(0).max(1e12);
const rate=z.number().finite().min(0).max(1);
const signed=z.number().finite().min(-1e12).max(1e12);
export const eventSchema=z.object({
 status:z.enum(['대기','진행중','완료']).default('대기'),
 id:z.string().min(1).max(80),version:z.number().int().min(0),title:z.string().trim().min(1).max(150),channel:z.string().trim().min(1).max(100),
 start:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),end:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),startTime:z.string().max(10),endTime:z.string().max(10),
 message:z.string().max(4000),url:z.string().max(2000).refine(v=>!v||/^https?:\/\//i.test(v),'링크는 http 또는 https 주소를 입력하세요.'),benefits:z.string().max(4000),
 shipping:money,logistics:money,packaging:money,other:money,targetQty:money,targetTraffic:money,actualTraffic:money,targetConversion:rate.optional(),actualConversion:rate.optional(),invoiceCount:money.optional(),targetAdRate:rate.optional(),actualAdRate:rate.optional(),
 blocks:z.array(z.object({name:z.string().max(100),composition:z.string().max(100),cycle:z.string().max(100),period:z.string().max(100),fee:rate,discount:rate.refine(v=>v<1),share:rate,basis:z.enum(['세팅가','자사 매출가','소비자 결제가']),guide:money.nullable(),channelExtra:z.enum(['O','X']).optional(),gift:z.string().max(100),uniform:z.string().max(100)})).min(1).max(10),
 lines:z.array(z.object({group:z.string().max(100),option:z.string().max(200),block:z.number().int().min(0).max(9),price:money.nullable(),basePrice:money.optional(),cost:money.nullable(),settingPrice:money.optional(),channelDiscount:money.optional(),ownDiscount:money.optional(),planned:money.nullable(),actual:money.nullable(),note:z.string().max(1000).optional(),source:z.string().max(200)})).max(200),
 media:z.array(z.object({name:z.string().max(100),expectedCpc:money.optional(),budget:money,spent:money,target:money,actual:money})).max(30),profitInputs:z.array(z.object({key:z.string().max(50),target:signed,actual:signed})).max(30).optional(),notes:z.string().max(10000)
}).refine(e=>e.start<=e.end,{message:'종료일은 시작일보다 빠를 수 없습니다.',path:['end']}).refine(e=>e.lines.every(l=>l.block<e.blocks.length),{message:'상품의 행사 조건을 확인하세요.'});
export type EventPlan=z.infer<typeof eventSchema>;
export function settlement(price:number,b:EventPlan['blocks'][number]){
 const setting=price/(1-b.discount),ownDiscount=setting*b.discount*b.share,channelDiscount=setting*b.discount*(1-b.share),sales=setting-ownDiscount;
 const fee=(b.basis==='세팅가'?setting:b.basis==='자사 매출가'?sales:price)*b.fee;
 return {setting,ownDiscount,channelDiscount,sales,fee,settled:sales-fee,effective:price?(price-sales+fee)/price:null};
}
export function totals(e:EventPlan,mode:'planned'|'actual'){
 let qty=0,revenue=0,sales=0,fee=0,cost=0,missingPrice=false,missingCost=false,missingQty=e.lines.length===0;
 for(const l of e.lines){const q=l[mode];if(q===null){missingQty=true;continue}qty+=q;if(!q)continue;if(l.price===null){missingPrice=true}else{const p=settlement(l.price,e.blocks[l.block]);revenue+=l.price*q;sales+=p.sales*q;fee+=p.fee*q}if(l.cost===null)missingCost=true;else cost+=l.cost*q;}
 const ad=e.media.reduce((s,m)=>s+(mode==='planned'?m.budget:m.spent),0),delivery=qty*(e.shipping+e.logistics+e.packaging),profit=sales-fee-cost-delivery-ad-e.other;
 const complete=!missingPrice&&!missingCost&&!missingQty;
 return {qty,revenue:missingPrice||missingQty?null:revenue,sales:missingPrice||missingQty?null:sales,fee:missingPrice||missingQty?null:fee,cost:missingCost||missingQty?null:cost,ad,delivery,profit:complete?profit:null,margin:complete&&sales?profit/sales:null,missingPrice,missingCost,missingQty,roas:!missingPrice&&!missingQty&&ad?revenue/ad:null};
}
