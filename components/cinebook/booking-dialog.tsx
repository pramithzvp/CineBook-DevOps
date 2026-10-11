'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,ArrowLeft,Check,Info,RotateCcw,Sparkles,Ticket,UserRound,Utensils,CreditCard,Smartphone,Store,Tag,Percent,Plus,Minus,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {
  Show,
  Booking,
  Profile,
  MOVIES,
  API,
  BOOKING_FEE,
  occupiedSeats,
  suggestSeats,
  showStarted,
  makeId,
  money,
  dateLabel,
  cinemaName,
  validEmail,
  apiRequest,
  ApiError,
  SEAT_TIERS,
  getSeatTier,
  calculateSeatsPrice,
  SNACKS,
  SelectedSnack,
  calculatePromoDiscount,
  PaymentMethod
} from '@/lib/cinebook';
import TicketView from './ticket-view';

export default function BookingDialog({
  show,
  bookings,
  profile,
  onClose,
  onBooked,
  onHistory
}:{
  show: Show;
  bookings: Booking[];
  profile: Profile | null;
  onClose: () => void;
  onBooked: (b: Booking) => void;
  onHistory: () => void;
}){
  const movie = MOVIES.find(m => m.id === show.movieId)!;
  const [step, setStep] = useState(1);
  const [seats, setSeats] = useState<string[]>([]);
  const [serverTaken, setServerTaken] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!API);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState('2');

  // Concessions / Snacks
  const [selectedSnacks, setSelectedSnacks] = useState<Record<string, number>>({});
  const [snackFilter, setSnackFilter] = useState<'all' | 'combo' | 'popcorn' | 'beverage' | 'snack'>('all');

  // Contact details
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('counter');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(profile?.name || '');

  // Completed booking receipt
  const [receipt, setReceipt] = useState<Booking | null>(null);
  const submitting = useRef(false);

  const taken = useMemo(() => API ? serverTaken : occupiedSeats(bookings, show), [bookings, show, serverTaken]);

  // Calculations
  const ticketsSubtotal = useMemo(() => calculateSeatsPrice(seats, movie.price), [seats, movie.price]);
  const bookingFees = seats.length * BOOKING_FEE;

  const snacksArray: SelectedSnack[] = useMemo(() => {
    return Object.entries(selectedSnacks)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = SNACKS.find(s => s.id === id)!;
        return { id, name: item.name, qty, price: item.price };
      });
  }, [selectedSnacks]);

  const snacksSubtotal = useMemo(() => {
    return snacksArray.reduce((acc, s) => acc + (s.price * s.qty), 0);
  }, [snacksArray]);

  const discount = appliedPromo?.discount || 0;
  const grandTotal = Math.max(0, ticketsSubtotal + bookingFees + snacksSubtotal - discount);

  const availabilityUrl = `/api/availability?movieId=${encodeURIComponent(show.movieId)}&date=${show.date}&time=${show.time}&cinema=${show.cinema}`;

  useEffect(() => {
    if (!API) return;
    let active = true;
    setLoading(true);
    setUnavailable(false);
    apiRequest<{ seats: string[] }>(availabilityUrl)
      .then(d => { if (active) { setServerTaken(d.seats); setError(''); } })
      .catch(e => { if (active) { setUnavailable(true); setError(e.message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [availabilityUrl, retry]);

  function toggle(seat: string) {
    if (loading || unavailable || taken.includes(seat)) return;
    setError('');
    if (seats.includes(seat)) {
      setSeats(seats.filter(s => s !== seat));
    } else if (seats.length >= 8) {
      setError('You can reserve up to 8 seats per booking.');
    } else {
      setSeats([...seats, seat].sort());
    }
  }

  function continueSeats() {
    if (showStarted(show.date, show.time)) {
      setError('This show has started. Close this window and choose another showtime.');
      return;
    }
    if (!seats.length) return;
    setError('');
    setStep(2); // Go to snacks
  }

  function updateSnackQty(snackId: string, delta: number) {
    setSelectedSnacks(prev => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: next };
    });
  }

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoError('');
    const res = calculatePromoDiscount(promoInput, ticketsSubtotal, snacksSubtotal);
    if (res.valid) {
      setAppliedPromo({ code: promoInput.trim().toUpperCase(), discount: res.discount, message: res.message });
      setPromoInput('');
    } else {
      setPromoError(res.message);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError('');
  }

  function review(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Enter a name with at least 2 characters.');
      return;
    }
    if (!validEmail(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setStep(4); // Go to Payment & Review
  }

  async function confirm() {
    if (submitting.current || !seats.length) return;

    // Validate card if card payment selected
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 12) {
        setError('Please enter a valid 12–16 digit card number.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter a valid 3 or 4 digit CVV.');
        return;
      }
    }

    submitting.current = true;
    setBusy(true);
    setError('');

    try {
      if (showStarted(show.date, show.time)) throw new Error('This show has started. Choose a new showtime.');
      if (seats.some(s => taken.includes(s))) throw new Error('One of these seats is unavailable. Please choose again.');

      const paymentDetails = paymentMethod === 'card'
        ? { method: 'card' as const, cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242', cardHolder: cardHolder || name }
        : paymentMethod === 'lanka_qr'
        ? { method: 'lanka_qr' as const, reference: 'LQR-' + Math.random().toString(36).substring(2, 9).toUpperCase() }
        : { method: 'counter' as const };

      const payload = {
        ...show,
        seats,
        name: name.trim(),
        email: email.trim(),
        snacks: snacksArray,
        promoCode: appliedPromo?.code,
        discount,
        paymentMethod,
        paymentDetails
      };

      const result = API
        ? await apiRequest<Omit<Booking, 'mode' | 'createdAt' | 'owner'>>('/api/bookings', { method: 'POST', body: JSON.stringify(payload) })
        : { ...payload, id: makeId(), total: grandTotal };

      const booking: Booking = {
        ...result,
        total: grandTotal,
        mode: API ? 'api' : 'local',
        createdAt: new Date().toISOString(),
        owner: profile?.email || 'guest',
        snacks: snacksArray,
        promoCode: appliedPromo?.code,
        discount,
        paymentMethod,
        paymentDetails
      };

      onBooked(booking);
      setReceipt(booking);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your booking could not be completed.');
      if (e instanceof ApiError && e.status === 409) {
        setSeats([]);
        setStep(1);
        setRetry(v => v + 1);
      }
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  const filteredSnacks = snackFilter === 'all' ? SNACKS : SNACKS.filter(s => s.category === snackFilter);

  return (
    <Dialog open onOpenChange={v => { if (!v && !busy) onClose(); }}>
      <DialogContent
        className="booking-modal"
        onEscapeKeyDown={e => { if (busy) e.preventDefault(); }}
        onPointerDownOutside={e => { if (busy) e.preventDefault(); }}
        showCloseButton={!busy}
      >
        <div className="modal-heading">
          <span className="eyebrow">{receipt ? 'YOUR CINEMA PASS' : 'RESERVE YOUR FAVOURITE SEATS'}</span>
          <DialogTitle>{receipt ? 'Booking Confirmed!' : movie.title}</DialogTitle>
          <DialogDescription>
            {receipt
              ? (paymentMethod === 'counter'
                  ? 'Reservation confirmed. Please pay and collect your ticket at the box office.'
                  : 'Payment processed and confirmed! Your electronic pass is ready.')
              : `${cinemaName(show.cinema)} · Hall ${movie.hall} · ${dateLabel(show.date)} · ${show.time}`}
          </DialogDescription>
        </div>

        {receipt ? (
          <>
            <TicketView booking={receipt} />
            <button className="text-button" onClick={onHistory}>
              View all my bookings <ArrowRight size={17} />
            </button>
          </>
        ) : (
          <>
            <ol className="booking-steps" aria-label="Booking progress">
              {['Seats', 'Snacks', 'Details', 'Payment & Review'].map((s, i) => (
                <li key={s} className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''} aria-current={step === i + 1 ? 'step' : undefined}>
                  <span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>

            {/* STEP 1: SEATS & TIERS */}
            {step === 1 && (
              <>
                <div className="seat-toolbar">
                  <div>
                    <b>Select your seats</b>
                    <p>Up to 8 tickets • Choose standard or luxury recliner</p>
                  </div>
                  <button className="text-button" disabled={!seats.length} onClick={() => { setSeats([]); setError(''); }}>
                    Clear selection
                  </button>
                </div>

                {/* Tier Legend */}
                <div className="seat-tier-legend">
                  <span className="tier-badge vip">
                    <i className="tier-dot vip" /> VIP Recliner (Row A–B: +{money(SEAT_TIERS.VIP.surcharge)})
                  </span>
                  <span className="tier-badge premium">
                    <i className="tier-dot premium" /> Premium Center (Row C–E: +{money(SEAT_TIERS.Premium.surcharge)})
                  </span>
                  <span className="tier-badge standard">
                    <i className="tier-dot standard" /> Standard (Row F–H: {money(movie.price)})
                  </span>
                </div>

                <div className="seat-legend">
                  <span><i /> Available</span>
                  <span><i className="selected" /> Selected</span>
                  <span><i className="taken" /> Unavailable</span>
                </div>

                <div className="screen">CINEMA SCREEN THIS WAY</div>

                <div className="seat-map" aria-label="Cinema seat map" aria-busy={loading}>
                  {'ABCDEFGH'.split('').map(row => {
                    const tier = getSeatTier(row + '1');
                    return (
                      <div className="seat-row" key={row}>
                        <span className={`row-label tier-${tier.toLowerCase()}`}>{row}</span>
                        {Array.from({length: 8}, (_, i) => {
                          const seat = row + (i + 1);
                          const isSelected = seats.includes(seat);
                          const isTaken = taken.includes(seat);
                          return (
                            <button
                              key={seat}
                              className={`seat tier-${tier.toLowerCase()} ${i === 4 ? 'aisle ' : ''}${isSelected ? 'selected ' : ''}`}
                              aria-label={`Seat ${seat}, ${tier} tier${isTaken ? ', unavailable' : ''}`}
                              aria-pressed={isSelected}
                              disabled={isTaken || loading || unavailable}
                              onClick={() => toggle(seat)}
                              title={`${seat} (${tier}): ${money(movie.price + SEAT_TIERS[tier].surcharge)}`}
                            >
                              {isTaken ? '×' : i + 1}
                            </button>
                          );
                        })}
                        <span className={`row-label tier-${tier.toLowerCase()}`}>{row}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Auto Suggest Group Seats */}
                <div className="suggest-row">
                  <Sparkles size={18} />
                  <Select value={group} onValueChange={setGroup}>
                    <SelectTrigger aria-label="Number of adjacent seats">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(n => (
                        <SelectItem key={n} value={String(n)}>
                          {n} seat{n > 1 ? 's' : ''} together
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    className="text-button"
                    disabled={loading || unavailable}
                    onClick={() => {
                      const result = suggestSeats(taken, Number(group));
                      if (result.length) {
                        setSeats(result);
                        setError('');
                      } else {
                        setError('No adjacent group is available in one row. Try fewer seats or select individually.');
                      }
                    }}
                  >
                    Auto-find seats
                  </button>
                </div>

                <div className="selection-summary">
                  <div>
                    <small>SELECTED SEATS ({seats.length})</small>
                    <strong>
                      {seats.length
                        ? seats.map(s => `${s} [${getSeatTier(s)}]`).join(', ')
                        : 'None selected'}
                    </strong>
                  </div>
                  <div>
                    <small>TICKETS & FEES</small>
                    <strong>{money(ticketsSubtotal + bookingFees)}</strong>
                  </div>
                </div>

                {error && <p className="error" role="alert">{error}</p>}
                {unavailable && (
                  <button className="secondary" onClick={() => setRetry(v => v + 1)}>
                    <RotateCcw size={16} /> Retry availability
                  </button>
                )}

                <button
                  className="primary wide"
                  disabled={!seats.length || loading || unavailable}
                  onClick={continueSeats}
                >
                  Continue to Snacks ({seats.length || 'your'} seat{seats.length === 1 ? '' : 's'}) <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* STEP 2: CONCESSIONS & SNACKS */}
            {step === 2 && (
              <div className="snacks-step">
                <div className="step-header">
                  <div>
                    <h3>Cinema Concessions & Snacks</h3>
                    <p>Upgrade your movie night with fresh popcorn, drinks, and combos</p>
                  </div>
                  <button className="text-button" onClick={() => { setSelectedSnacks({}); }}>
                    Clear snacks
                  </button>
                </div>

                {/* Category filters */}
                <div className="snack-categories">
                  {(['all', 'combo', 'popcorn', 'beverage', 'snack'] as const).map(cat => (
                    <button
                      key={cat}
                      className={`chip ${snackFilter === cat ? 'active' : ''}`}
                      onClick={() => setSnackFilter(cat)}
                    >
                      {cat === 'all' ? 'All Items' : cat === 'combo' ? 'Combos' : cat === 'popcorn' ? 'Popcorn' : cat === 'beverage' ? 'Beverages' : 'Snacks'}
                    </button>
                  ))}
                </div>

                {/* Snacks grid */}
                <div className="snack-grid">
                  {filteredSnacks.map(item => {
                    const count = selectedSnacks[item.id] || 0;
                    return (
                      <div className={`snack-card ${count > 0 ? 'selected' : ''}`} key={item.id}>
                        <span className="snack-emoji">{item.emoji}</span>
                        <div className="snack-details">
                          <h4>{item.name}</h4>
                          <p>{item.description}</p>
                          <b>{money(item.price)}</b>
                        </div>
                        <div className="snack-counter">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name}`}
                            disabled={count === 0}
                            onClick={() => updateSnackQty(item.id, -1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{count}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name}`}
                            onClick={() => updateSnackQty(item.id, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="selection-summary">
                  <div>
                    <small>SNACKS ADDED</small>
                    <strong>{snacksArray.length ? `${snacksArray.reduce((n, s) => n + s.qty, 0)} items` : 'No snacks added'}</strong>
                  </div>
                  <div>
                    <small>SNACKS SUBTOTAL</small>
                    <strong>{money(snacksSubtotal)}</strong>
                  </div>
                </div>

                <div className="split-actions">
                  <button type="button" className="secondary" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Seats
                  </button>
                  <button type="button" className="primary" onClick={() => setStep(3)}>
                    Continue to Details <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT DETAILS */}
            {step === 3 && (
              <form className="form-stack" onSubmit={review}>
                <div className="notice">
                  <UserRound size={19} />
                  <p>
                    {profile
                      ? `Booking as ${profile.name}. Contact details will appear on your e-ticket.`
                      : 'Guest booking welcome. Provide the recipient name for your cinema admission pass.'}
                  </p>
                </div>

                <label>
                  Full name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Name on ticket"
                  />
                </label>

                <label>
                  Email address
                  <input
                    required
                    type="email"
                    maxLength={200}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>

                <div className="notice">
                  <Info size={18} />
                  <p>A digital pass with a scannable QR code will be generated immediately upon confirmation.</p>
                </div>

                {error && <p className="error" role="alert">{error}</p>}

                <div className="split-actions">
                  <button type="button" className="secondary" onClick={() => { setError(''); setStep(2); }}>
                    <ArrowLeft size={16} /> Snacks
                  </button>
                  <button type="submit" className="primary">
                    Payment & Review <ArrowRight size={17} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: PAYMENT & REVIEW */}
            {step === 4 && (
              <div className="review">
                {/* Movie Summary */}
                <div className="review-film">
                  <img src={movie.image} alt="" />
                  <div>
                    <h3>{movie.title}</h3>
                    <p>{dateLabel(show.date)} · {show.time}</p>
                    <p>{cinemaName(show.cinema)} · Hall {movie.hall} ({movie.format})</p>
                    <strong>Seats: {seats.map(s => `${s} (${getSeatTier(s)})`).join(', ')}</strong>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="promo-box">
                  <div className="promo-input-row">
                    <Tag size={18} />
                    <input
                      placeholder="Promo Code (e.g. CINE10, STUDENT)"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      disabled={!!appliedPromo}
                    />
                    {appliedPromo ? (
                      <button type="button" className="secondary" onClick={handleRemovePromo}>
                        <X size={15} /> Remove
                      </button>
                    ) : (
                      <button type="button" className="primary" onClick={handleApplyPromo}>
                        Apply
                      </button>
                    )}
                  </div>
                  {appliedPromo && (
                    <span className="promo-success-badge">
                      <Percent size={14} /> {appliedPromo.message}
                    </span>
                  )}
                  {promoError && <span className="promo-error-msg">{promoError}</span>}
                </div>

                {/* Order Lines */}
                <div className="order-line">
                  <span>{seats.length} × Tickets ({movie.format})</span>
                  <b>{money(ticketsSubtotal)}</b>
                </div>
                <div className="order-line">
                  <span>Booking fee ({money(BOOKING_FEE)} / seat)</span>
                  <b>{money(bookingFees)}</b>
                </div>

                {snacksArray.length > 0 && (
                  <div className="order-line">
                    <span>Snacks ({snacksArray.reduce((n, s) => n + s.qty, 0)} items)</span>
                    <b>{money(snacksSubtotal)}</b>
                  </div>
                )}

                {discount > 0 && (
                  <div className="order-line discount">
                    <span>Discount ({appliedPromo?.code})</span>
                    <b>-{money(discount)}</b>
                  </div>
                )}

                <div className="order-line total">
                  <span>Total payable</span>
                  <b>{money(grandTotal)}</b>
                </div>

                {/* Payment Method Selector */}
                <div className="payment-selection">
                  <small>SELECT PAYMENT METHOD</small>
                  <div className="payment-options">
                    <button
                      type="button"
                      className={`payment-option ${paymentMethod === 'counter' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('counter')}
                    >
                      <Store size={20} />
                      <div>
                        <strong>Pay at Counter</strong>
                        <small>Cash or card at cinema</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard size={20} />
                      <div>
                        <strong>Credit / Debit Card</strong>
                        <small>Visa, Mastercard, Amex</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`payment-option ${paymentMethod === 'lanka_qr' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('lanka_qr')}
                    >
                      <Smartphone size={20} />
                      <div>
                        <strong>LankaQR / Mobile</strong>
                        <small>FriMi, Genie, Q+ QR</small>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Card Fields if Card selected */}
                {paymentMethod === 'card' && (
                  <div className="card-fields form-stack">
                    <label>
                      Card number
                      <input
                        placeholder="•••• •••• •••• 4242"
                        value={cardNumber}
                        maxLength={19}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                          setCardNumber(formatted);
                        }}
                      />
                    </label>
                    <div className="split-fields">
                      <label>
                        Expiry date
                        <input
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                            setCardExpiry(v);
                          }}
                        />
                      </label>
                      <label>
                        CVV
                        <input
                          placeholder="123"
                          maxLength={4}
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* LankaQR simulation info */}
                {paymentMethod === 'lanka_qr' && (
                  <div className="lanka-qr-notice">
                    <Smartphone size={24} />
                    <div>
                      <strong>Instant LankaQR Payment</strong>
                      <p>Scan with your preferred banking app (FriMi, Genie, Commercial Bank Q+, Flash). Reservation is issued instantly upon confirming.</p>
                    </div>
                  </div>
                )}

                <div className="review-contact">
                  <strong>Ticket recipient: {name}</strong>
                  <span>{email}</span>
                  <button className="text-button" disabled={busy} onClick={() => setStep(3)}>
                    Edit details
                  </button>
                </div>

                {error && <p className="error" role="alert">{error}</p>}

                <div className="split-actions">
                  <button className="secondary" disabled={busy} onClick={() => setStep(3)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="primary" disabled={busy} onClick={confirm}>
                    {busy ? 'Securing reservation…' : paymentMethod === 'counter' ? 'Confirm Reservation' : `Pay & Confirm (${money(grandTotal)})`}
                    <Check size={17} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
