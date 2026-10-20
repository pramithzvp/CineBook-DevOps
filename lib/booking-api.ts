import {Booking} from './cinebook';
export const BOOKING_API_ENABLED = process.env.NEXT_PUBLIC_BOOKING_API_ENABLED === 'true';
export const BOOKING_API = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080').replace(/\/$/,'') + '/api';
export type ApiShow = {id:string;date:string;time:string;hall:string;basePrice:number;bookingFee:number};
export type ApiSeat = {label:string;price:number;available:boolean};
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string, options:RequestInit={}):Promise<T>{
 if(!BOOKING_API_ENABLED)throw new ApiError('Booking services are running in local demo mode.',0);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
 try{const r=await fetch(BOOKING_API+path,{...options,credentials:'include',signal:controller.signal,headers:{'Content-Type':'application/json','X-Cinebook-Client':'web',...options.headers}});
 const data:unknown=await r.json().catch(()=>({}));if(!r.ok){const message=(data&&typeof data==='object'&&'message' in data&&typeof data.message==='string')?data.message:'The request could not be completed.';throw new ApiError(message,r.status);}return data as T;
 }catch(e){if(e instanceof ApiError)throw e;throw new Error('Cannot reach the booking server. Check that Spring Boot and MySQL are running, then retry.');}finally{clearTimeout(timeout);}
}
export async function loadBookings(){if(!BOOKING_API_ENABLED)return [];await api('/session',{method:'POST'});return api<Booking[]>('/bookings');}
