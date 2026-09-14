export const COMPANY_DOMAIN='intakefoods.kr';
export const ADMIN_EMAIL='yujin.oh@intakefoods.kr';
export function companyRole(email:string):'admin'|'member'|null{
 const normalized=email.trim().toLowerCase();
 if(normalized===ADMIN_EMAIL)return 'admin';
 return /^[^@\s]+@intakefoods\.kr$/.test(normalized)?'member':null;
}
