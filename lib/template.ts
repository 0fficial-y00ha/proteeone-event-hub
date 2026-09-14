import type {EventPlan} from './event-model';
type Source={name:string,rows:{row:number,cells:Record<string,any>}[]};
export function makeTemplate(sources:Source[]):EventPlan{
 const s=sources.find(s=>s.name==='시트_260831')!;
 const c=(r:number,col:string)=>s.rows.find(x=>x.row===r)?.cells[col];
 const n=(v:any)=>typeof v==='number'?v:null;
 return {status:'대기',id:'template-260831',version:0,title:c(6,'D'),channel:c(6,'B'),start:c(4,'B').slice(0,10),end:c(4,'D').slice(0,10),startTime:'11:00',endTime:'12:00',message:'',url:'',benefits:'사은품 없음 · 균일가 미적용',shipping:2860,logistics:502,packaging:0,other:0,targetQty:500,targetTraffic:10000,actualTraffic:15000,targetConversion:n(c(39,'H'))??0,actualConversion:n(c(40,'H'))??0,
 blocks:[7,35,65].map(r=>({name:c(r,'B'),composition:c(r,'D'),cycle:c(r+1,'B'),period:c(r+1,'D'),fee:c(r+2,'B'),discount:c(r+3,'B'),share:c(r+3,'D'),basis:['세팅가','자사 매출가','소비자 결제가'].includes(c(r+2,'D'))?c(r+2,'D'):'소비자 결제가',guide:n(c(r+4,'D')),gift:r===7?'X':'확인 필요',uniform:r===7?'X':'확인 필요'})),
 lines:s.rows.filter(r=>r.row>=5&&r.row<=19).map(r=>({group:r.cells.O,option:r.cells.P,block:r.cells.O==='파우치'?2:0,price:n(r.cells.T),cost:n(r.cells.U),planned:n(r.cells.V),actual:n(r.cells.AB),source:'시트_260831!O'+r.row+':AI'+r.row})),
 media:s.rows.filter(r=>r.row>=45&&r.row<=57).map(r=>({name:r.cells.G,budget:0,spent:0,target:0,actual:0})),
 invoiceCount:n(c(15,'K'))??0,targetAdRate:n(c(32,'H'))??.05,actualAdRate:n(c(32,'I'))??.05,
 notes:'26년 행사시트 디벨롭 (1).xlsx / 시트_260831 기준. 일부 원본 #REF! 수수료 기준은 소비자 결제가로 표시하며 채널을 선택하면 채널 기준을 적용합니다.'};
}
