"use client";

import { Calculator } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import Planner from './planner';

export type Source = { name:string, rows:{row:number,cells:Record<string,any>}[] };

export default function Workspace({sources,isAdmin=false}:{sources:Source[],isAdmin?:boolean}) {
  return <main className="workspace">
    <Toaster richColors/>
    <header className="topbar">
      <a className="brand" href="/"><span className="brandmark">P</span>PROTEEONE</a>
      <span className="source-tag">{isAdmin&&<a href="/admin">관리 기록 · </a>}내부 운영용</span>
    </header>
    <div className="page calculator-page">
      <div className="heading">
        <div>
          <p className="eyebrow">EVENT SETTLEMENT CALCULATOR</p>
          <h1>프로티원 행사 관리</h1>
        </div>
        <span className="date-label"><Calculator size={18}/> 행사 조건 입력</span>
      </div>
      <aside className="quick-guide" aria-label="사용 방법"><b>사용 방법</b><span>① 행사 조건 입력</span><span>② 가격·맛 구성 확정</span><span>③ 예상 판매 수량 입력</span><span>④ 광고 계획 확인 후 웹에 저장</span></aside>
      <Planner sources={sources}/>
    </div>
    <footer>PROTI ONE · 내부 행사 운영</footer>
  </main>
}
