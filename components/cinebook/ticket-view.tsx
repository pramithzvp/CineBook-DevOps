'use client';
import {Ticket,Download,Printer,CalendarPlus,CheckCircle2,XCircle,QrCode,CreditCard,Smartphone,Store,Utensils} from 'lucide-react';
import {Booking,ALL_MOVIES,bookingStatus,cinemaName,dateLabel,money,downloadTicket,downloadCalendar,getSeatTier,SEAT_TIERS} from '@/lib/cinebook';
import {generateQrSvg} from '@/lib/qr';

export default function TicketView({booking}:{booking:Booking}){
  const movie = ALL_MOVIES.find(m => m.id === booking.movieId) || { title: 'Movie Ticket', hall: 1, format: '2D', rating: 'PG-13', image: '/images/dune.jpg' };
  const status = bookingStatus(booking);

  if(booking.mode==='demo'||booking.mode==='api') return <div className="receipt demo-receipt">
    <div className="receipt-heading"><strong>{booking.mode==='api'?'CINEBOOK RESERVATION':'DEMO RESERVATION'}</strong><span>{status}</span></div>
    <div className="receipt-main"><img src={movie.image} alt=""/><div><h2>{movie.title}</h2><p>{cinemaName(booking.cinema)}</p><p>{dateLabel(booking.date)} · {booking.time}</p><p>{booking.hall}</p><p>Seats: {booking.seats.join(', ')}</p><p>Sample total: {money(booking.total)}</p></div></div>
    <p className="receipt-notice">Not valid for cinema entry. No real seats reserved and no payment collected.</p>
    <p className="receipt-id">{booking.id}</p><button className="secondary" onClick={()=>downloadTicket(booking)}>Download reservation</button>
  </div>;

  // Scannable ticket data payload
  const qrPayload = `https://cinebook.lk/verify?id=${booking.id}&m=${encodeURIComponent(movie.title)}&d=${booking.date}&t=${booking.time}&s=${booking.seats.join(',')}&c=${booking.cinema}`;
  const qrSvg = generateQrSvg(qrPayload, 130, 'currentColor');

  const seatBadges = booking.seats.map(s => {
    const tier = getSeatTier(s);
    return `${s} (${SEAT_TIERS[tier].badge})`;
  }).join(' · ');

  return (
    <div className="ticket-view">
      <article id="printable-ticket" className="receipt">
        <div className="receipt-heading">
          <span><Ticket size={20}/> CineBook Sri Lanka</span>
          <span className={'status ' + status.toLowerCase()}>{status}</span>
        </div>

        <div className="receipt-main">
          <img src={movie.image} alt="" />
          <div>
            <span className="eyebrow">
              {booking.paymentMethod === 'card' ? 'PAID WITH CARD' : booking.paymentMethod === 'lanka_qr' ? 'LANKAQR VERIFIED' : 'PAY AT CINEMA'}
            </span>
            <h2>{movie.title}</h2>
            <p>{movie.format} · {movie.rating} · English screenings</p>
          </div>
        </div>

        <div className="receipt-details">
          <div>
            <small>DATE & SHOWTIME</small>
            <strong>{dateLabel(booking.date)}</strong>
            <span>{booking.time} · Sri Lanka Time</span>
          </div>
          <div>
            <small>CINEMA & HALL</small>
            <strong>{cinemaName(booking.cinema)}</strong>
            <span>Screen Hall {movie.hall}</span>
          </div>
        </div>

        <div className="receipt-seats">
          <small>CONFIRMED SEATS</small>
          <strong>{seatBadges}</strong>
        </div>

        {booking.snacks && booking.snacks.length > 0 && (
          <div className="receipt-snacks">
            <small><Utensils size={14} style={{display:'inline',marginRight:4}}/> CONCESSIONS & SNACKS</small>
            <div className="receipt-snacks-list">
              {booking.snacks.map(snack => (
                <div key={snack.id} className="receipt-snack-item">
                  <span>{snack.qty} × {snack.name}</span>
                  <b>{money(snack.price * snack.qty)}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="receipt-details">
          <div>
            <small>TICKET HOLDER</small>
            <strong>{booking.name}</strong>
            <span>{booking.email || 'Counter guest checkout'}</span>
          </div>
          <div>
            <small>TOTAL AMOUNT</small>
            <strong>{money(booking.total)}</strong>
            <span>
              {booking.paymentMethod === 'card'
                ? `Paid by Card (•••• ${booking.paymentDetails?.cardLast4 || '4242'})`
                : booking.paymentMethod === 'lanka_qr'
                ? 'Paid via LankaQR'
                : booking.cancelled
                ? 'Payment reversed at counter'
                : 'Pay at cinema counter'}
            </span>
          </div>
        </div>

        {booking.discount && booking.discount > 0 && (
          <div className="receipt-promo-tag">
            <small>PROMO CODE APPLIED</small>
            <span>{booking.promoCode || 'DISCOUNT'}: Saved {money(booking.discount)}</span>
          </div>
        )}

        {/* Scannable Verification QR Code */}
        <div className="receipt-qr-section">
          <div className="qr-wrapper" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className="qr-info">
            <small>DIGITAL GATE PASS</small>
            <strong>Scan for Hall Admission</strong>
            <p>Present at CineBook usher podium or self-service kiosk.</p>
          </div>
        </div>

        <div className="receipt-id">
          <span>BOOKING ID: <b>{booking.id}</b></span>
          <div className="receipt-payment-chip">
            {booking.paymentMethod === 'card' ? <CreditCard size={14}/> : booking.paymentMethod === 'lanka_qr' ? <Smartphone size={14}/> : <Store size={14}/>}
            <span>{booking.paymentMethod === 'card' ? 'Online Card Pay' : booking.paymentMethod === 'lanka_qr' ? 'LankaQR' : 'Pay at Counter'}</span>
          </div>
        </div>

        <p className="receipt-notice">
          {booking.cancelled
            ? 'Cancelled — this reservation is no longer valid.'
            : 'Payment verified / payable at counter. Show QR pass upon arrival.'}
        </p>
      </article>

      <div className="ticket-actions">
        <button className="primary" onClick={() => downloadTicket(booking)}>
          <Download size={17} /> Download ticket
        </button>
        <button className="secondary" onClick={() => window.print()}>
          <Printer size={17} /> Print / PDF
        </button>
        {status === 'Upcoming' && (
          <button className="secondary" onClick={() => downloadCalendar(booking)}>
            <CalendarPlus size={17} /> Add to calendar
          </button>
        )}
      </div>

      <p className="helper">
        {booking.cancelled ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
        {' '}
        {'Saved in this browser. Download or print your reservation pass before leaving.'}
      </p>
    </div>
  );
}
