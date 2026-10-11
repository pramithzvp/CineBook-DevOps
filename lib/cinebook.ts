import {CINEMA_LISTINGS} from './cinema-listings';
export const MOVIES = [
  {
    id: 'dune',
    language: 'English',
    collection: 'English',
    title: 'Dune: Part Two',
    genres: ['Sci-fi', 'Adventure'],
    minutes: 166,
    rating: 'PG-13',
    year: 2024,
    image: '/images/dune.jpg',
    tag: 'THE BIG-SCREEN EXPERIENCE',
    description: 'Paul Atreides joins the Fremen on a journey of revenge, facing a choice between love and the fate of the universe.',
    format: 'IMAX',
    times: ['11:00', '15:00', '19:00'],
    price: 2200,
    hall: 1,
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w'
  },
  {
    id: 'interstellar',
    language: 'English',
    collection: 'English',
    title: 'Interstellar',
    genres: ['Sci-fi', 'Drama'],
    minutes: 169,
    rating: 'PG-13',
    year: 2014,
    image: '/images/interstellar.jpg',
    tag: 'BACK ON THE BIG SCREEN',
    description: 'A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.',
    format: '2D',
    times: ['10:30', '14:30', '18:30'],
    price: 1500,
    hall: 2,
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
  },
  {
    id: 'batman',
    language: 'English',
    collection: 'English',
    title: 'The Batman',
    genres: ['Action', 'Crime'],
    minutes: 176,
    rating: 'PG-13',
    year: 2022,
    image: '/images/batman.jpg',
    tag: 'A NIGHT IN GOTHAM',
    description: 'Batman follows a trail of cryptic clues into Gotham’s underworld, where he must forge new relationships to unmask a killer.',
    format: 'DOLBY',
    times: ['11:30', '15:30', '19:30'],
    price: 1800,
    hall: 3,
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4'
  },
  {
    id: 'oppenheimer',
    language: 'English',
    collection: 'English',
    title: 'Oppenheimer',
    genres: ['Drama', 'History'],
    minutes: 180,
    rating: 'R',
    year: 2023,
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    tag: 'ACADEMY AWARD WINNER',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    format: 'IMAX',
    times: ['12:00', '16:00', '20:00'],
    price: 2200,
    hall: 1,
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg'
  },
  {
    id: 'avatar',
    language: 'English',
    collection: 'English',
    title: 'Avatar: The Way of Water',
    genres: ['Sci-fi', 'Action'],
    minutes: 192,
    rating: 'PG-13',
    year: 2022,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    tag: 'RETURN TO PANDORA',
    description: 'Jake Sully lives with his newfound family on the extrasolar moon Pandora, uniting the reef clans against humanity.',
    format: 'DOLBY',
    times: ['11:15', '15:45', '19:45'],
    price: 1800,
    hall: 2,
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0'
  },
  {
    id: 'gaadi',
    language: 'Sinhala',
    collection: 'Sinhala',
    title: 'Gaadi: Children of the Sun',
    genres: ['Drama', 'Adventure'],
    minutes: 104,
    rating: 'PG-13',
    year: 2020,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    tag: 'SRI LANKAN CINEMATIC GEM',
    description: 'In 1814 Ceylon, a noblewoman stripped of her caste is forced to marry an outcast in order to survive.',
    format: '2D',
    times: ['13:00', '17:00', '21:00'],
    price: 1500,
    hall: 3,
    trailerUrl: 'https://www.youtube.com/embed/kK3hQGZ97pA'
  },
{
  "id": "ho-gaana-pokuna",
  "title": "Ho Gaana Pokuna",
  "language": "Sinhala",
  "collection": "Sinhala",
  "genres": [
    "Drama",
    "Family"
  ],
  "minutes": 120,
  "rating": "Unrated",
  "year": 2015,
  "image": "/images/ho-gaana-pokuna.jpg",
  "tag": "SINHALA CINEMA",
  "description": "A village schoolteacher helps her pupils pursue their dream of seeing the ocean.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "maharaja",
  "title": "Maharaja",
  "language": "Tamil",
  "collection": "Tamil",
  "genres": [
    "Action",
    "Thriller"
  ],
  "minutes": 140,
  "rating": "Unrated",
  "year": 2024,
  "image": "/images/maharaja.jpg",
  "tag": "TAMIL CINEMA",
  "description": "A barber reports a mysterious theft, setting off an investigation with unexpected consequences.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "96",
  "title": "96",
  "language": "Tamil",
  "collection": "Tamil",
  "genres": [
    "Romance",
    "Drama"
  ],
  "minutes": 158,
  "rating": "Unrated",
  "year": 2018,
  "image": "/images/96.jpg",
  "tag": "TAMIL CINEMA",
  "description": "Two former school sweethearts reconnect at a reunion and revisit their shared past.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "inception",
  "title": "Inception",
  "language": "English",
  "collection": "English",
  "genres": [
    "Sci-fi",
    "Action"
  ],
  "minutes": 148,
  "rating": "Unrated",
  "year": 2010,
  "image": "/images/inception.jpg",
  "tag": "ENGLISH CINEMA",
  "description": "A skilled dream thief takes on a dangerous mission to plant an idea in another person’s mind.",
  "format": "IMAX",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "parasite",
  "title": "Parasite",
  "language": "Korean",
  "collection": "Korean",
  "genres": [
    "Thriller",
    "Drama"
  ],
  "minutes": 132,
  "rating": "Unrated",
  "year": 2019,
  "image": "/images/parasite.png",
  "tag": "KOREAN CINEMA",
  "description": "A struggling family finds work in a wealthy household, with increasingly unsettling consequences.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "train-to-busan",
  "title": "Train to Busan",
  "language": "Korean",
  "collection": "Korean",
  "genres": [
    "Action",
    "Horror"
  ],
  "minutes": 118,
  "rating": "Unrated",
  "year": 2016,
  "image": "/images/train-to-busan.jpg",
  "tag": "KOREAN CINEMA",
  "description": "A father and daughter board a train as a fast-moving outbreak throws the country into chaos.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "your-name",
  "title": "Your Name",
  "language": "Japanese",
  "collection": "Japanese",
  "genres": [
    "Animation",
    "Romance"
  ],
  "minutes": 107,
  "rating": "Unrated",
  "year": 2016,
  "image": "/images/your-name.png",
  "tag": "JAPANESE CINEMA",
  "description": "Two teenagers discover a mysterious connection that reaches across distance and time.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "spirited-away",
  "title": "Spirited Away",
  "language": "Japanese",
  "collection": "Japanese",
  "genres": [
    "Animation",
    "Fantasy"
  ],
  "minutes": 125,
  "rating": "Unrated",
  "year": 2001,
  "image": "/images/spirited-away.png",
  "tag": "JAPANESE CINEMA",
  "description": "A young girl enters a spirit world and must find the courage to rescue her parents.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "amelie",
  "title": "Amélie",
  "language": "French",
  "collection": "European",
  "genres": [
    "Romance",
    "Comedy"
  ],
  "minutes": 122,
  "rating": "Unrated",
  "year": 2001,
  "image": "/images/amelie.jpg",
  "tag": "EUROPEAN CINEMA",
  "description": "A young Parisian quietly changes the lives of those around her while searching for her own happiness.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
},
{
  "id": "intouchables",
  "title": "The Intouchables",
  "language": "French",
  "collection": "European",
  "genres": [
    "Comedy",
    "Drama"
  ],
  "minutes": 112,
  "rating": "Unrated",
  "year": 2011,
  "image": "/images/intouchables.jpg",
  "tag": "EUROPEAN CINEMA",
  "description": "An unlikely friendship grows between a wealthy man and his unconventional caregiver.",
  "format": "2D",
  "times": [
    "10:00",
    "14:00",
    "18:00"
  ],
  "price": 1500,
  "hall": 1,
  "trailerUrl": ""
}
];

// Venue details checked against operator websites on 23 September 2026.
export const CINEMAS = [
  {
    "id": "scope-havelock",
    "name": "Scope Cinemas — Havelock City Mall",
    "city": "Colombo",
    "operator": "Scope Cinemas",
    "address": "Havelock City Mall, 324 Havelock Road, Colombo",
    "description": "Six-screen multiplex with IMAX with Laser and a Director’s Lounge.",
    "features": [
      "IMAX with Laser",
      "Dolby Atmos",
      "4K projection"
    ],
    "url": "https://www.scopecinemas.com/cinemas/scope-cinemas-multiplex-havelock-city-mall"
  },
  {
    "id": "scope-ccc",
    "name": "Scope Cinemas — Colombo City Centre",
    "city": "Colombo",
    "operator": "Scope Cinemas",
    "address": "137, Sir James Pieris Mawatha, Colombo 2",
    "description": "Six-screen city-centre multiplex with Gold Class seating and Dolby Atmos.",
    "features": [
      "Gold Class",
      "Dolby Atmos",
      "2D / 3D"
    ],
    "url": "https://www.scopecinemas.com/cinemas/scope-cinemas-multiplex-colombo-city-centre"
  },
  {
    "id": "scope-colpetty",
    "name": "Scope Cinemas — Colpetty",
    "city": "Colombo",
    "operator": "Scope Cinemas",
    "address": "35, Srimath Anagarika Dharmapala Mawatha, Colombo 3",
    "description": "The historic Liberty cinema location, with two upgraded digital screens.",
    "features": [
      "Digital 2D",
      "Two screens"
    ],
    "url": "https://www.scopecinemas.com/cinemas/scope-cinemas-colpetty"
  },
  {
    "id": "scope-kiribathgoda",
    "name": "Liberty by Scope — Kiribathgoda",
    "city": "Kiribathgoda",
    "operator": "Scope Cinemas",
    "address": "94, Makola Road, Kiribathgoda",
    "description": "A single-screen cinema serving the Kelaniya–Kiribathgoda area.",
    "features": [
      "Digital 2D",
      "5.1 surround sound"
    ],
    "url": "https://www.scopecinemas.com/cinemas/liberty-by-scope-cinemas-kiribathgoda"
  },
  {
    "id": "pvr-one-galle-face",
    "name": "PVR Cinemas — One Galle Face",
    "city": "Colombo",
    "operator": "PVR Cinemas",
    "address": "One Galle Face Mall, 1A Centre Road, Colombo 2",
    "description": "PVR’s cinema at One Galle Face Mall. Check the operator for available films and screen options.",
    "features": [
      "Mall cinema",
      "Online booking"
    ],
    "url": "https://www.pvrcinemas.lk/"
  },
  {
    "id": "kcc-multiplex",
    "name": "KCC Multiplex",
    "city": "Kandy",
    "operator": "KCC Multiplex",
    "address": "Kandy City Centre, 5 Dalada Veediya, Kandy",
    "description": "Cinema multiplex at Kandy City Centre, with film listings and ticket booking on its official website.",
    "features": [
      "City-centre cinema",
      "Online booking"
    ],
    "url": "https://kccmultiplex.lk/"
  }
];

// Preserve old demo receipts without relabelling them as real venue bookings.
const LEGACY_CINEMAS: Record<string,string> = {colombo:"CineBook Colombo (legacy demo)",kandy:"CineBook Kandy (legacy demo)",galle:"CineBook Galle Fort (legacy demo)",negombo:"CineBook Negombo Coast (legacy demo)",jaffna:"CineBook Jaffna Heritage (legacy demo)"};

export type Movie = typeof MOVIES[number];
export const ALL_MOVIES = [...MOVIES,...CINEMA_LISTINGS.map(m=>({...m,genres:m.genres.split(' / '),collection:m.language,minutes:120,rating:'Unrated',year:2026,tag:'IN CINEMAS',description:'Cinema listing with a sample booking layout.',format:'2D',times:['10:00','14:00','18:00','21:00'],price:1500,hall:1,trailerUrl:''}))];
export type Profile = { name: string; email: string };

// --- Seat Tiers ---
export type SeatTier = 'VIP' | 'Premium' | 'Standard';
export interface SeatTierInfo {
  tier: SeatTier;
  name: string;
  surcharge: number;
  description: string;
  badge: string;
}

export const SEAT_TIERS: Record<SeatTier, SeatTierInfo> = {
  VIP: { tier: 'VIP', name: 'VIP Recliner', surcharge: 600, description: 'Row A–B • Ultra-wide leather recliner', badge: 'VIP' },
  Premium: { tier: 'Premium', name: 'Premium Center', surcharge: 250, description: 'Row C–E • Prime acoustic center line', badge: 'PREMIUM' },
  Standard: { tier: 'Standard', name: 'Standard Seat', surcharge: 0, description: 'Row F–H • Classic cinema stadium seat', badge: 'STANDARD' }
};

export function getSeatTier(seat: string): SeatTier {
  const row = seat.charAt(0).toUpperCase();
  if (row === 'A' || row === 'B') return 'VIP';
  if (row === 'C' || row === 'D' || row === 'E') return 'Premium';
  return 'Standard';
}

export function seatPrice(seat: string, basePrice: number): number {
  return basePrice + SEAT_TIERS[getSeatTier(seat)].surcharge;
}

export function calculateSeatsPrice(seats: string[], basePrice: number): number {
  return seats.reduce((sum, s) => sum + seatPrice(s, basePrice), 0);
}

// --- Concessions / Food & Beverages ---
export interface SnackItem {
  id: string;
  name: string;
  category: 'popcorn' | 'beverage' | 'combo' | 'snack';
  price: number;
  description: string;
  emoji: string;
}

export const SNACKS: SnackItem[] = [
  { id: 'caramel-popcorn', name: 'Caramel Glaze Popcorn (L)', category: 'popcorn', price: 750, description: 'Warm popcorn coated with crunchy golden caramel', emoji: '🍿' },
  { id: 'salted-popcorn', name: 'Cinema Butter Salted (L)', category: 'popcorn', price: 650, description: 'Freshly popped with gourmet cinema butter seasoning', emoji: '🍿' },
  { id: 'cheese-popcorn', name: 'Spicy Cheddar Popcorn (L)', category: 'popcorn', price: 800, description: 'Tangy cheese dust with subtle Sri Lankan spice kick', emoji: '🧀' },
  { id: 'duo-combo', name: 'Movie Night Duo Combo', category: 'combo', price: 1250, description: '1 Large Popcorn + 2 Chilled Soft Drinks (500ml)', emoji: '🎬' },
  { id: 'mega-combo', name: 'Mega Cine Feast', category: 'combo', price: 1850, description: '2 Large Popcorns + Nachos & Cheese + 2 Drinks', emoji: '🎉' },
  { id: 'nachos-cheese', name: 'Crispy Tortilla Nachos', category: 'snack', price: 850, description: 'Golden corn chips with warm melted jalapeño cheese', emoji: '🌮' },
  { id: 'coca-cola', name: 'Chilled Coca-Cola (500ml)', category: 'beverage', price: 350, description: 'Ice-cold classic fizzy beverage', emoji: '🥤' },
  { id: 'iced-milo', name: 'Iced Milo Supreme', category: 'beverage', price: 450, description: 'Island favorite chocolate malt served over cracked ice', emoji: '🧋' },
  { id: 'mineral-water', name: 'Bottled Spring Water (750ml)', category: 'beverage', price: 200, description: 'Pure natural Sri Lankan spring water', emoji: '💧' }
];

export interface SelectedSnack {
  id: string;
  name: string;
  qty: number;
  price: number;
}

// --- Promo Codes & Discounts ---
export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  description: string;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  'CINE10': { code: 'CINE10', discountType: 'percentage', value: 10, description: '10% off cinema tickets' },
  'STUDENT': { code: 'STUDENT', discountType: 'fixed', value: 300, description: 'LKR 300 student concession' },
  'POPCORN': { code: 'POPCORN', discountType: 'fixed', value: 350, description: 'LKR 350 snack bonus discount' },
  'LKMOVIE': { code: 'LKMOVIE', discountType: 'percentage', value: 15, description: '15% cinema lover discount' }
};

export function calculatePromoDiscount(code: string, ticketSubtotal: number, snacksSubtotal: number): { valid: boolean; discount: number; message: string } {
  const clean = code.trim().toUpperCase();
  const promo = PROMO_CODES[clean];
  if (!promo) return { valid: false, discount: 0, message: 'Invalid coupon code. Try CINE10 or STUDENT.' };
  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round((ticketSubtotal * promo.value) / 100);
  } else {
    discount = Math.min(promo.value, ticketSubtotal + snacksSubtotal);
  }
  return { valid: true, discount, message: `${promo.code} applied! -${money(discount)} (${promo.description})` };
}

// --- Payment Options ---
export type PaymentMethod = 'counter' | 'card' | 'lanka_qr';
export interface PaymentDetails {
  method: PaymentMethod;
  cardLast4?: string;
  cardHolder?: string;
  reference?: string;
}

// --- Audience Reviews ---
export interface Review {
  id: string;
  movieId: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', movieId: 'dune', author: 'Kasun Perera', rating: 5, comment: 'The IMAX presentation in Colombo was sensational! Visual effects and sound design blew us away.', date: '2026-09-18' },
  { id: 'r2', movieId: 'dune', author: 'Nisali Fernando', rating: 5, comment: 'Hans Zimmer score and Denis Villeneuve direction at its absolute peak. Recliner seats were super comfy.', date: '2026-09-20' },
  { id: 'r3', movieId: 'interstellar', author: 'Dilshan Mendis', rating: 5, comment: 'Watching this masterpiece again on the big screen was pure goosebumps. 10/10.', date: '2026-09-15' },
  { id: 'r4', movieId: 'batman', author: 'Aravinda Rajaratnam', rating: 4, comment: 'The Dolby Atmos sound was phenomenal during the Batmobile chase sequence.', date: '2026-09-19' },
  { id: 'r5', movieId: 'oppenheimer', author: 'Senura Kaluarachchi', rating: 5, comment: 'Unmatched intensity and acting. Projection was crystal clear and the Trinity test was breathtaking.', date: '2026-09-12' },
  { id: 'r6', movieId: 'avatar', author: 'Malsha Jayawardene', rating: 5, comment: 'Visual spectacle beyond words. The 3D depth and water world visuals are incredible.', date: '2026-09-21' },
  { id: 'r7', movieId: 'gaadi', author: 'Chamari Wickramasinghe', rating: 5, comment: 'A breathtaking Sri Lankan historical film. Proud to see such world-class cinematography on screen.', date: '2026-09-10' }
];

export type Booking = {
  id: string;
  movieId: string;
  date: string;
  time: string;
  cinema: string;
  seats: string[];
  name: string;
  email?: string;
  total: number;
  cancelled?: boolean;
  hall?: string;
  mode: 'local' | 'api' | 'demo';
  createdAt: string;
  owner: string;
  // Feature additions
  snacks?: SelectedSnack[];
  promoCode?: string;
  discount?: number;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
};

export type Show = { movieId: string; date: string; time: string; cinema: string };

export const API = process.env.NEXT_PUBLIC_BOOKING_API_ENABLED === 'true'
  ? process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || ''
  : '';
export const BOOKING_FEE = 100;
export const DEMO_OCCUPIED = ['C3', 'C4', 'D5', 'D6', 'F2', 'F3'];
export const money = (value: number) => 'LKR ' + (value || 0).toLocaleString('en-LK');
export const duration = (value: number) => `${Math.floor(value / 60)}h ${value % 60}m`;
export const cinemaName = (id: string) => CINEMAS.find(c => c.id === id)?.name || LEGACY_CINEMAS[id] || 'Unknown cinema';
export const dateLabel = (date: string) => date ? new Date(date + 'T12:00:00+05:30').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }) : 'Choose a date';
export const showStarted = (date: string, time: string, now = Date.now()) => !date || !time || new Date(`${date}T${time}:00+05:30`).getTime() <= now;

export function dateRange() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (type: string) => parts.find(p => p.type === type)!.value;
  const today = `${value('year')}-${value('month')}-${value('day')}`;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function makeId() {
  return 'CB-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function bookingStatus(b: Booking) {
  return b.cancelled ? 'Cancelled' : showStarted(b.date, b.time) ? 'Past' : 'Upcoming';
}

export function occupiedSeats(bookings: Booking[], show: Show) {
  return [...new Set([...DEMO_OCCUPIED, ...bookings.filter(b => (b.mode === 'local' || (b.mode as string) === 'demo') && !b.cancelled && b.movieId === show.movieId && b.date === show.date && b.time === show.time && b.cinema === show.cinema).flatMap(b => b.seats)])];
}

export function suggestSeats(taken: string[], count: number) {
  if (count < 1 || count > 4) return [];
  for (const row of ['E', 'D', 'F', 'C', 'G', 'B', 'H', 'A']) {
    for (const start of [3, 5, 2, 6, 1, 7, 4, 8]) {
      const group = Array.from({ length: count }, (_, i) => row + (start + i));
      if (start + count - 1 > 8 || (start <= 4 && start + count - 1 > 4) || group.some(s => taken.includes(s))) continue;
      return group;
    }
  }
  return [];
}

export function filterMovies(query: string, genre: string, format: string, sort: string, saved?: string[], collection = 'all') {
  return MOVIES.filter(m => (!saved || saved.includes(m.id)) && (collection === 'all' || m.collection === collection) && `${m.title} ${m.genres.join(' ')} ${m.language} ${m.collection} ${m.format}`.toLowerCase().includes(query.trim().toLowerCase()) && (genre === 'all' || m.genres.includes(genre)) && (format === 'all' || m.format === format)).sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'duration' ? a.minutes - b.minutes : sort === 'title' ? a.title.localeCompare(b.title) : 0);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const r = await fetch(API + path, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options?.headers } });
    let data: unknown;
    try {
      data = await r.json();
    } catch {
      throw new ApiError('The server returned an unreadable response. Please try again.', r.status);
    }
    if (!r.ok) throw new ApiError((data as { message?: string }).message || 'Could not complete this request.', r.status);
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw new Error('The server took too long. Please try again.');
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ticketText(b: Booking) {
  const movie = ALL_MOVIES.find(m => m.id === b.movieId) || { title: 'Movie Ticket', hall: 1, format: '2D', price: 1500, minutes: 120 };
  if(b.mode==='demo'||b.mode==='api') return `CINEBOOK — DEMO RESERVATION — NOT VALID FOR ENTRY\n${b.cancelled?'CANCELLED — NOT VALID':''}\n${b.id}\n${movie.title}\n${cinemaName(b.cinema)}\n${b.date} ${b.time}\nSeats: ${b.seats.join(', ')}\nSample total: ${money(b.total)}\nStatus: ${bookingStatus(b)}\nNo payment or real cinema reservation has been made.`;
  const seatList = b.seats.map(s => `${s} (${SEAT_TIERS[getSeatTier(s)].badge})`).join(', ');
  const ticketsCost = calculateSeatsPrice(b.seats, movie.price);
  const feeCost = b.seats.length * BOOKING_FEE;
  const snacksList = b.snacks && b.snacks.length > 0
    ? '\nSnacks:\n' + b.snacks.map(s => `  • ${s.qty} × ${s.name} (${money(s.price * s.qty)})`).join('\n')
    : '';
  const discountLine = b.discount ? `\nDiscount (${b.promoCode || 'PROMO'}): -${money(b.discount)}` : '';
  const paymentLine = b.paymentMethod === 'card'
    ? `Payment: Paid via Card (ending in ${b.paymentDetails?.cardLast4 || '••••'})`
    : b.paymentMethod === 'lanka_qr'
    ? 'Payment: LankaQR Instant Verification (Confirmed)'
    : 'Payment: Pay at Cinema Counter';

  return `CINEBOOK — RESERVATION
${b.id}
Status: ${bookingStatus(b)}

${movie.title}
${dateLabel(b.date)} at ${b.time} (Sri Lanka time)
${cinemaName(b.cinema)} • Hall ${movie.hall} • ${movie.format}
Seats: ${seatList}
Guest: ${b.name}
Tickets subtotal: ${money(ticketsCost)}
Booking fee: ${money(feeCost)}${snacksList}${discountLine}
Total: ${money(b.total)}
${paymentLine}

${b.cancelled ? 'CANCELLED — NOT VALID' : 'Payment confirmed / due at the cinema. Present this reservation at the counter.'}`;
}

export function downloadTicket(b: Booking) {
  downloadText(b.id + '.txt', ticketText(b));
}

export function downloadCalendar(b: Booking) {
  const movie = ALL_MOVIES.find(m => m.id === b.movieId) || { title: 'Movie Night', hall: 1, minutes: 120 };
  const start = new Date(`${b.date}T${b.time}:00+05:30`);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
  const end = new Date(start.getTime() + movie.minutes * 60000);
  downloadText(b.id + '.ics', [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CineBook//Movie Night//EN',
    'BEGIN:VEVENT',
    `UID:${b.id}@cinebook.local`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${movie.title}`,
    `LOCATION:${cinemaName(b.cinema)} - Hall ${movie.hall}`,
    `DESCRIPTION:Seats ${b.seats.join(' / ')}. ${b.snacks && b.snacks.length ? `Snacks: ${b.snacks.map(s => `${s.qty}x ${s.name}`).join(', ')}. ` : ''}Admission reservation.`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n'), 'text/calendar;charset=utf-8');
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordChecks(password: string) {
  return [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password)];
}

// Validate browser-stored reservations before restoring them.
export function restoreBookings(raw: string | null): Booking[] {
  try {
    const data = JSON.parse(raw || '[]');
    return Array.isArray(data) ? data.filter(b =>
      b &&
      typeof b.id === 'string' &&
      ALL_MOVIES.some(m => m.id === b.movieId) &&
      typeof b.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
      typeof b.time === 'string' &&
      /^\d{2}:\d{2}$/.test(b.time) &&
      (CINEMAS.some(c => c.id === b.cinema) || Object.hasOwn(LEGACY_CINEMAS, b.cinema)) &&
      Array.isArray(b.seats) &&
      b.seats.length > 0 &&
      b.seats.length <= 8 &&
      b.seats.every((s: unknown) => typeof s === 'string' && /^[A-H][1-8]$/.test(s)) &&
      typeof b.name === 'string' &&
      typeof b.owner === 'string' &&
      typeof b.total === 'number' &&
      Number.isFinite(b.total) &&
      (b.mode === 'local' || b.mode === 'api' || b.mode === 'demo')
    ).slice(0, 100) : [];
  } catch {
    return [];
  }
}
