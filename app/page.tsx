import Workspace from './workspace';
import {companyRole} from '@/lib/access';
import {readDataJson} from '@/lib/r2-data';
import {requireChatGPTUser} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Home(){const user=await requireChatGPTUser('/');const base=await readDataJson<{name:string,rows:{row:number,cells:Record<string,unknown>}[]}[]>('base.json');return <Workspace isAdmin={companyRole(user.email)==='admin'} sources={base.filter(s=>!s.name.includes('PERFORMANCE_DB')&&!s.name.includes('MEDIA_PLAN_DB'))}/>}

