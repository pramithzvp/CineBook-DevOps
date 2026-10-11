'use client';
import {useState,useEffect,useRef} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {CINEMA_LISTINGS} from '@/lib/cinema-listings';
import {Booking,Profile,CINEMAS,dateLabel,money} from '@/lib/cinebook';
import {api,ApiShow,ApiSeat,ApiError} from '@/lib/booking-api';
import TicketView from './ticket-view';
export default function CinemaSeatDialog({movieId,initialCinema,profile,onBooked,onClose,onHistory}:{movieId:string;initialCinema:string;profile:Profile|null;bookings:Booking[];onBooked:(booking:Booking)=>void;onClose:()=>void;onHistory:()=>void}){
 const movie=CINEMA_LISTINGS.find(m=>m.id===movieId)!;
 const [cinema,setCinema]=useState(initialCinema),[shows,setShows]=useState<ApiShow[]>([]),[showId,setShowId]=useState('');
 const [inventory,setInventory]=useState<ApiSeat[]>([]),[seats,setSeats]=useState<string[]>([]),[review,setReview]=useState(false);
 const [receipt,setReceipt]=useState<Booking|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
 const [name,setName]=useState(profile?.name||''),[email,setEmail]=useState(profile?.email||'');
 const requestKey=useRef('');const submitting=useRef(false);const selectionVersion=useRef(0);
 const show=shows.find(s=>s.id===showId);const dates=[...new Set(shows.map(s=>s.date))];
 const total=seats.reduce((sum,label)=>sum+(inventory.find(s=>s.label===label)?.price||0),0);
 function clearSelection(){selectionVersion.current++;setSeats([]);setReview(false);requestKey.current='';setError('');}
 useEffect(()=>{let active=true;setLoading(true);setShows([]);setShowId('');setInventory([]);clearSelection();
  api<ApiShow[]>('/shows?movieId='+encodeURIComponent(movieId)+'&cinema='+encodeURIComponent(cinema)).then(data=>{if(active){setShows(data);setShowId(data[0]?.id||'');if(!data.length)setLoading(false);}}).catch(e=>{if(active){setError(e.message);setLoading(false);}});return()=>{active=false;};
 },[movieId,cinema,retry]);
 useEffect(()=>{if(!showId)return;let active=true;setLoading(true);setInventory([]);clearSelection();
  api<{seats:ApiSeat[]}>('/shows/'+showId+'/seats').then(data=>{if(active)setInventory(data.seats);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};
 },[showId]);
 // Poll availability while the picker is open. A final transaction still protects checkout.
 useEffect(()=>{if(!showId||receipt)return;let active=true;const id=setInterval(()=>{const version=selectionVersion.current;api<{seats:ApiSeat[]}>('/shows/'+showId+'/seats').then(data=>{if(active&&version===selectionVersion.current){setInventory(data.seats);setSeats(old=>{const available=old.filter(label=>data.seats.some(s=>s.label===label&&s.available));if(available.length!==old.length){setError('A selected seat is no longer available. Please review your selection.');setReview(false);requestKey.current='';}return available;});}}).catch(()=>{});},15000);return()=>{active=false;clearInterval(id);};},[showId,receipt]);
 async function confirm(){
  if(submitting.current||!show||!seats.length)return;submitting.current=true;setBusy(true);setError('');
  if(!requestKey.current)requestKey.current=crypto.randomUUID();
  try{await api('/session',{method:'POST'});const booking=await api<Booking>('/bookings',{method:'POST',body:JSON.stringify({showId,requestKey:requestKey.current,seats,name:name.trim(),email:email.trim()})});onBooked(booking);setReceipt(booking);}
  catch(e){setError((e as Error).message);if(e instanceof ApiError&&e.status===409){requestKey.current='';setReview(false);setSeats([]);try{const data=await api<{seats:ApiSeat[]}>('/shows/'+showId+'/seats');setInventory(data.seats);}catch{setInventory([]);}}}
  finally{submitting.current=false;setBusy(false);}
 }
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent className="booking-modal cinema-seat-dialog">
  <DialogTitle>{receipt?'Reservation saved':movie.title+' — Select seats'}</DialogTitle>
  <DialogDescription>Sample cinema programme. Reservations are saved in CineBook’s database. These are not cinema-issued tickets; no payment is collected.</DialogDescription>
  {receipt?<><TicketView booking={receipt}/><button className="primary" onClick={onHistory}>View my bookings</button></>:<>
   <fieldset disabled={busy} className="cinema-booking-fields" style={{border:0,padding:0}}>
    <label>Cinema<Select value={cinema} onValueChange={v=>{setCinema(v);}} disabled={busy}><SelectTrigger aria-label="Booking cinema"><SelectValue/></SelectTrigger><SelectContent>{CINEMAS.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></label>
    <label>Date<Select value={show?.date||''} onValueChange={v=>setShowId(shows.find(s=>s.date===v)!.id)} disabled={busy||!shows.length}><SelectTrigger aria-label="Booking date"><SelectValue placeholder="Choose a date"/></SelectTrigger><SelectContent>{dates.map(d=><SelectItem key={d} value={d}>{dateLabel(d)}</SelectItem>)}</SelectContent></Select></label>
    <label>Showtime<Select value={showId} onValueChange={setShowId} disabled={busy||!shows.length}><SelectTrigger aria-label="Booking time"><SelectValue placeholder="Choose a show"/></SelectTrigger><SelectContent>{shows.filter(s=>s.date===show?.date).map(s=><SelectItem key={s.id} value={s.id}>{s.time}</SelectItem>)}</SelectContent></Select></label>
   </fieldset>
   {loading?<p role="status">Loading available seats…</p>:!shows.length?<p>{error?'Availability is unavailable.':'No upcoming shows are available for this cinema.'}</p>:review?<form id="reservation-contact" onSubmit={e=>{e.preventDefault();void confirm();}} className="seat-review">
    <h3>Review your reservation</h3><p>{CINEMAS.find(c=>c.id===cinema)?.name} · {show?.hall}</p><p>{dateLabel(show!.date)} · {show?.time}</p><p>Seats: <strong>{seats.join(', ')}</strong></p><p>Total: <strong>{money(total)}</strong></p>
    <label>Your name<input className="booking-contact-input" aria-label="Your name" required maxLength={100} value={name} disabled={busy} onChange={e=>{setName(e.target.value);requestKey.current='';}}/></label>
    <label>Email<input className="booking-contact-input" aria-label="Booking email" type="email" required maxLength={200} value={email} disabled={busy} onChange={e=>{setEmail(e.target.value);requestKey.current='';}}/></label>
    <p className="helper">Your booking is saved in the database. Sign in to keep access across browsers, or use this browser’s guest session for up to 30 days. No email or payment is sent.</p>
   </form>:<>
    <div className="screen">SCREEN · {show?.hall}</div><div className="seat-map" role="group" aria-label="Select up to 8 seats">
    {'ABCDEFGH'.split('').map(row=><div className="seat-row" key={row}><span aria-hidden="true">{row}</span>{inventory.filter(s=>s.label.startsWith(row)).map((seat,i)=><button key={seat.label} type="button" className={'seat '+(i===4?'aisle ':'')+(!seat.available?'taken ':seats.includes(seat.label)?'selected ':'')} aria-label={'Seat '+seat.label+(!seat.available?', unavailable':'')} aria-pressed={seats.includes(seat.label)} disabled={!seat.available||busy} onClick={()=>{requestKey.current='';setSeats(old=>old.includes(seat.label)?old.filter(s=>s!==seat.label):old.length<8?[...old,seat.label]:old);}}>{seat.label}</button>)}</div>)}
    </div><p className="helper">Choose 1–8 seats. A–B: VIP; C–E: Premium; F–H: Standard. Prices include the booking fee.</p><p aria-live="polite">{seats.length?seats.join(', '):'No seats selected'} · Total: <strong>{money(total)}</strong></p>
   </>}
   {error&&<div role="alert"><p>{error}</p>{!busy&&<button className="secondary" onClick={()=>{setError('');setRetry(v=>v+1);}}>Reload availability</button>}</div>}
   <div className="split-actions">{review&&<button className="secondary" disabled={busy} onClick={()=>setReview(false)}>Back to seats</button>}{review?<button form="reservation-contact" type="submit" className="primary" disabled={busy||!seats.length}>{busy?'Saving…':'Confirm reservation'}</button>:<button className="primary" disabled={loading||!seats.length||!!error} onClick={()=>setReview(true)}>Review selection</button>}</div>
  </>}
 </DialogContent></Dialog>;
}
