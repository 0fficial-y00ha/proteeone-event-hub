import Workspace from './workspace';
import {companyRole} from '@/lib/access';
import base from '../data/base.json';
import {requireChatGPTUser} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Home(){const user=await requireChatGPTUser('/');return <Workspace isAdmin={companyRole(user.email)==='admin'} sources={base.filter(s=>!s.name.includes('PERFORMANCE_DB')&&!s.name.includes('MEDIA_PLAN_DB'))}/>}

