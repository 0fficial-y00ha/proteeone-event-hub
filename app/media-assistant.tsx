"use client";
export default function MediaAssistant({channel}:{channel:string,before:string,budget:number}){return <div className="media-assistant"><h3>광고비 · 트래픽 설정 도우미</h3><p>{channel}의 과거 ROAS와 목표·실제 매출을 참고해 광고비와 트래픽 계획을 돕습니다.</p><p className="service-status"><b>현재 운영 준비 중</b> · DB 백업 및 API 연결 요망</p></div>}
