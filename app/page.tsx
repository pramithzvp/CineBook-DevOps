'use client';
import {CINEMA_LISTINGS,CINEMA_CHECKED} from '@/lib/cinema-listings';
import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Ticket,Film,MapPin,Heart,Search,Sun,Moon,UserRound,LogOut,ChevronDown,SlidersHorizontal,X,Clock,Armchair,Check,Download,HelpCircle,Building2,Monitor,CalendarDays,Info,RotateCcw,Play,Star,Utensils,Tag,CreditCard,Smartphone,Store} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuLabel} from '@/components/ui/dropdown-menu';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
import {Switch} from '@/components/ui/switch';
import {Toaster,toast} from 'sonner';
import AuthDialog from '@/components/cinebook/auth-dialog';
import {getCurrentUser,logoutUser} from '@/lib/auth-api';
import CinemaSeatDialog from '@/components/cinebook/cinema-seat-dialog';
import {api,BOOKING_API_ENABLED,loadBookings} from '@/lib/booking-api';
import {getAllMovies} from '@/src/services/movieService.js';
import TicketView from '@/components/cinebook/ticket-view';
import {
  MOVIES,
  ALL_MOVIES,
  CINEMAS,
  Profile,
  Show,
  Booking,
  API,
  dateRange,
  dateLabel,
  duration,
  money,
  showStarted,
  bookingStatus,
  cinemaName,
  restoreBookings,
  downloadTicket,
  INITIAL_REVIEWS,
  Review,
  getSeatTier,
  SEAT_TIERS
} from '@/lib/cinebook';

type BackendMovie = {
  id: number | string;
  title: string;
  genre: string;
  language: string;
  duration: number;
  description: string;
  imageUrl: string;
};

type CatalogueMovie = {
  id: string;
  title: string;
  genre: string;
  genres: string[];
  language: string;
  collection: string;
  duration: number;
  minutes: number;
  description: string;
  imageUrl: string;
};

function toCatalogueMovie(movie:BackendMovie):CatalogueMovie {
  const genres = movie.genre.split(/[,/]/).map(value=>value.trim()).filter(Boolean);
  return {...movie,id:String(movie.id),genres,collection:movie.language,minutes:movie.duration};
}

function Choice({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:[string,string][]}){
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}><SelectValue/></SelectTrigger>
      <SelectContent>
        {options.map(([v,text])=><SelectItem key={v} value={v}>{text}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Empty({icon:Icon,title,text,action,onAction}:{icon:typeof Film;title:string;text:string;action?:string;onAction?:()=>void}){
  return (
    <div className="empty">
      <span><Icon size={34}/></span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action && <button className="primary" onClick={onAction}>{action}<ArrowRight size={17}/></button>}
    </div>
  );
}

export default function Home(){
  const [tab,setTab] = useState('now-showing'), [theme,setTheme] = useState<'dark'|'light'>('dark'), [dates,setDates] = useState<string[]>([]), [date,setDate] = useState(''), [cinema,setCinema] = useState('scope-havelock'), [ready,setReady] = useState(false), [clock,setClock] = useState(0);
  const [query,setQuery] = useState(''), [genre,setGenre] = useState('all'), [format,setFormat] = useState('all'), [sort,setSort] = useState('featured'), [saved,setSaved] = useState<string[]>([]), [detail,setDetail] = useState<CatalogueMovie|null>(null);
  const [apiMovies,setApiMovies] = useState<CatalogueMovie[]>([]), [moviesLoading,setMoviesLoading] = useState(true), [moviesError,setMoviesError] = useState(''), [movieRetry,setMovieRetry] = useState(0);
  const [demoCatalogue,setDemoCatalogue] = useState(false);
  const [seatMovie,setSeatMovie] = useState<string|null>(null);
  const [collection,setCollection] = useState('all');
  const [authOpen,setAuthOpen] = useState(false), [profile,setProfile] = useState<Profile|null>(null), [profileName,setProfileName] = useState(''), [helpOpen,setHelpOpen] = useState(false);
  const [bookings,setBookings] = useState<Booking[]>([]), [bookingFilter,setBookingFilter] = useState('all'), [bookingQuery,setBookingQuery] = useState(''), [viewTicket,setViewTicket] = useState<Booking|null>(null), [cancelId,setCancelId] = useState<string|null>(null), [storageAvailable,setStorageAvailable] = useState(true);

  // Reviews
  const [reviews,setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [backendError,setBackendError] = useState('');
  async function refreshBookings(){if(!BOOKING_API_ENABLED){setBackendError('');return;}try{const rows=await loadBookings();setBookings(old=>[...rows,...old.filter(b=>b.mode!=='api')]);setBackendError('');}catch(e){setBackendError((e as Error).message);}}
  useEffect(()=>{if(BOOKING_API_ENABLED)void refreshBookings();},[]);
  useEffect(()=>{let active=true;getCurrentUser().then(user=>{if(active){setProfile(user);setProfileName(user.name);}}).catch(()=>{});return()=>{active=false;};},[]);
  const [reviewName,setReviewName] = useState('');
  const [reviewRating,setReviewRating] = useState(5);
  const [reviewComment,setReviewComment] = useState('');

  useEffect(()=>{
    let active = true;
    setMoviesLoading(true);
    setMoviesError('');
    getAllMovies()
      .then((rows:BackendMovie[])=>{
        if(active){setApiMovies(rows.map(toCatalogueMovie));setDemoCatalogue(false);}
      })
      .catch(()=>{
        if(active){
          setApiMovies(MOVIES.map(movie=>({...movie,genre:movie.genres.join(', '),duration:movie.minutes,imageUrl:movie.image})));
          setDemoCatalogue(true);
        }
      })
      .finally(()=>{
        if(active) setMoviesLoading(false);
      });
    return()=>{active=false;};
  },[movieRetry]);

  useEffect(()=>{
    const ds = dateRange();
    setDates(ds);
    setDate(MOVIES.every(m=>m.times.every(t=>showStarted(ds[0],t))) ? ds[1] : ds[0]);
    setClock(Date.now());
    try{
      const t = localStorage.getItem('cinebook-theme');
      if(t==='light'||t==='dark') setTheme(t);
      const f = JSON.parse(localStorage.getItem('cinebook-saved')||'[]');
      if(Array.isArray(f)) setSaved(f.filter((v):v is string=>typeof v==='string'));
      const c = localStorage.getItem('cinebook-cinema');
      if(CINEMAS.some(v=>v.id===c)) setCinema(c!);
      setBookings(old=>[...old.filter(b=>b.mode==='api'),...restoreBookings(sessionStorage.getItem('cinebook-bookings-v2')).filter(b=>b.mode!=='api')]);
      const savedReviews = JSON.parse(localStorage.getItem('cinebook-reviews')||'[]');
      if(Array.isArray(savedReviews) && savedReviews.length > 0){
        setReviews([...savedReviews, ...INITIAL_REVIEWS]);
      }
    }catch{
      setStorageAvailable(false);
    }
    setReady(true);
    const id = setInterval(()=>{
      setClock(Date.now());
      const next = dateRange();
      setDates(next);
      setDate(d=>next.includes(d)?d:next[0]);
    },30000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if(ready) try{localStorage.setItem('cinebook-theme',theme);}catch{setStorageAvailable(false);}
  },[theme,ready]);

  useEffect(()=>{
    if(!ready)return;
    try{
      localStorage.setItem('cinebook-saved',JSON.stringify(saved));
      localStorage.setItem('cinebook-cinema',cinema);
    }catch{setStorageAvailable(false);}
  },[saved,cinema,ready]);

  useEffect(()=>{
    if(!ready)return;
    try{
      sessionStorage.setItem('cinebook-bookings-v2',JSON.stringify(bookings.filter(b=>b.mode!=='api')));
    }catch{setStorageAvailable(false);}
  },[bookings,ready]);

  const filtered = useMemo(()=>apiMovies.filter(m=>(tab!=='saved'||saved.includes(m.id))&&(collection==='all'||m.collection===collection)&&`${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(query.trim().toLowerCase())&&(genre==='all'||m.genres.includes(genre))).sort((a,b)=>sort==='duration'?a.minutes-b.minutes:sort==='title'?a.title.localeCompare(b.title):0),[apiMovies,query,genre,sort,tab,saved,collection]);
  const visibleBookings = bookings.filter(b=>(bookingFilter==='all'||bookingStatus(b).toLowerCase()===bookingFilter)&&`${b.id} ${ALL_MOVIES.find(m=>m.id===b.movieId)?.title} ${b.name}`.toLowerCase().includes(bookingQuery.toLowerCase()));
  const upcoming = bookings.filter(b=>bookingStatus(b)==='Upcoming');
  const activeFilters = collection!=='all'||genre!=='all'||format!=='all'||query.length>0||sort!=='featured';

  function resetFilters(){setCollection('all');setQuery('');setGenre('all');setFormat('all');setSort('featured');}
  function toggleSaved(id:string){
    const exists = saved.includes(id);
    setSaved(old=>exists?old.filter(x=>x!==id):[...old,id]);
    toast(exists?'Removed from saved films':'Added to saved films');
  }

  function navigate(value:string){
    setTab(value);
    if(value==='profile') setProfileName(profile?.name||'');
  }

  function nextDate(){
    const tomorrow = dates[1]||dates[0];
    setDate(tomorrow);
    toast('Showing the next day’s programme');
  }

  async function logout(){
    try{await logoutUser();}catch(e){toast.error((e as Error).message);return;}
    setBookings(old=>old.filter(b=>b.mode!=='api'));
    setProfile(null);
    setProfileName('');
    setTab('movies');
    toast('You’ve been signed out');
    void refreshBookings();
  }

  function handleAddReview(e:React.FormEvent, movieId:string){
    e.preventDefault();
    if(!reviewName.trim() || !reviewComment.trim()){
      toast.error('Please enter your name and thoughts.');
      return;
    }
    const newRev: Review = {
      id: 'r_' + Date.now(),
      movieId,
      author: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString().slice(0,10)
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    try{
      const localOnly = updated.filter(r => !INITIAL_REVIEWS.some(ir => ir.id === r.id));
      localStorage.setItem('cinebook-reviews', JSON.stringify(localOnly));
    }catch{}
    setReviewComment('');
    toast.success('Your review was posted! Thank you for rating.');
  }

  useEffect(()=>{
    if(!ready)return;
    const ctx = (document as Document&{modelContext?:{registerTool:(tool:unknown,options:unknown)=>Promise<void>}}).modelContext;
    if(!ctx)return;
    const controller = new AbortController();
    const tools = [
      {
        name:'list_movies',
        description:'List online catalogue films and separately verified cinema listings.',
        inputSchema:{type:'object',properties:{},additionalProperties:false},
        annotations:{readOnlyHint:true},
        execute:()=>({online:apiMovies.map(({id,title,language})=>({id,title,language})),cinema:CINEMA_LISTINGS,checked:CINEMA_CHECKED})
      },

    ];
    for(const tool of tools) try{Promise.resolve(ctx.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{}
    return()=>controller.abort();
  },[ready,date,cinema,apiMovies]);

  const movieReviews = useMemo(()=>{
    if(!detail) return [];
    return reviews.filter(r => r.movieId === detail.id);
  },[detail, reviews]);

  const averageRating = useMemo(()=>{
    if(!movieReviews.length) return '4.9';
    const sum = movieReviews.reduce((acc,r)=>acc+r.rating,0);
    return (sum / movieReviews.length).toFixed(1);
  },[movieReviews]);

  function onlineLink(movie:CatalogueMovie){
    return 'https://www.netflix.com/search?q='+encodeURIComponent(movie.title);
  }

  function renderNowShowing(){
    const cinemaFilms = CINEMA_LISTINGS.filter(m=>`${m.title} ${m.language} ${m.genres}`.toLowerCase().includes(query.toLowerCase().trim()));
    return <div className="now-showing-home">
        <section className="cinema-priority" aria-labelledby="cinema-heading">
          <div className="cinema-section-header">
            <div className="cinema-heading-copy">
              <div className="cinema-kicker"><span><Ticket size={14}/> ON THE BIG SCREEN</span><span className="cinema-film-count">{cinemaFilms.length} {cinemaFilms.length===1?'film':'films'}</span></div>
              <h1 id="cinema-heading">Now <span>Showing.</span></h1>
              <p>Your next cinema night starts here.</p>
            </div>
            <button className="cinema-explore-button" onClick={()=>{resetFilters();navigate('movies');}}>Explore all movies <ArrowUpRight size={18}/></button>
          </div>
          <div className="cinema-listing-meta">
            <span><MapPin size={15}/> Scope Cinemas <span className="cinema-meta-country">· Sri Lanka</span></span>
            <span><CalendarDays size={15}/> Checked {CINEMA_CHECKED}</span>
          </div>
          <div className="cinema-priority-grid">
            {cinemaFilms.map(m=><article className="cinema-feature" key={m.id}>
              <button className="cinema-poster-button" onClick={()=>setSeatMovie(m.id)} aria-label={'Select seats for '+m.title}><img src={m.image} alt={m.title+' poster'}/><span className="cinema-now-badge">IN CINEMAS</span></button>
              <div><small>{m.language} · {m.genres}</small><h3>{m.title}</h3><button className="primary" onClick={()=>setSeatMovie(m.id)}>Select seats <Armchair size={16}/></button></div>
            </article>)}
          </div>
          {!cinemaFilms.length&&<p className="catalogue-note">No verified cinema listings match this search. Try another title or explore the Movies section.</p>}
          <div className="cinema-section-footer">
            <p>Reservations are saved in CineBook. Schedules and seat layouts are samples, not live cinema inventory.</p>
            <button className="cinema-source" onClick={()=>navigate('cinemas')}>Cinema halls <ArrowRight size={14}/></button>
          </div>
        </section>
    </div>;
  }

  function renderCatalogue(isSaved=false){
    return (
      <>
        <section className="intro">
          <div>
            <span className="eyebrow">{isSaved?'KEEP THE GOOD ONES CLOSE':'YOUR NEXT NIGHT OUT'}</span>
            <h1>{isSaved?'Your watchlist':'Movies'}<span>.</span></h1>
            <p>{isSaved?'The films you’re looking forward to. Saved on this device.':'Explore the collection and find your next film to watch online.'}</p>
          </div>
          <div className="programme-label">
            <span>THE CINEBOOK COLLECTION</span>
            <p>On the big screen. On your screen.</p>
          </div>
        </section>

        <div className="watch-section-heading" id="watch-online">
          <div><span className="eyebrow">YOUR NIGHT IN</span><h2>{isSaved?'Saved films':'Watch online'}</h2></div>
          <Monitor size={27}/>
        </div>
        <p className="catalogue-note">Find films on official streaming services. Availability varies by country; a subscription or rental may be required. Full films play on the provider’s site.</p>

        <div className="movie-collections" role="group" aria-label="Film language and region">
          {['all','Sinhala','Tamil','English','Korean','Japanese','European'].map(value=>(
            <button key={value} type="button" aria-pressed={collection===value} onClick={()=>setCollection(value)}>
              {value==='all'?'All films':value}<span>{apiMovies.filter(m=>(value==='all'||m.collection===value)&&(!isSaved||saved.includes(m.id))).length}</span>
            </button>
          ))}
        </div>
        <p className="catalogue-note">Explore films by language or region. Streaming availability has not been verified for Sri Lanka.</p>
        <div className="filter-bar">
          <span className="filter-caption">Refine your movie night</span>
          <div className="filter-choices">
            <SlidersHorizontal size={18}/>
            <Choice label="Genre" value={genre} onChange={setGenre} options={['all',...Array.from(new Set(apiMovies.flatMap(m=>m.genres))).sort()].map(g=>[g,g==='all'?'All genres':g])}/>
            <Choice label="Sort movies" value={sort} onChange={setSort} options={[['featured','Featured'],['title','Title A–Z'],['duration','Shortest first']]}/>
          </div>
        </div>

        <div className="section-label">
          <span aria-live="polite">{filtered.length} {filtered.length===1?'film':'films'} {isSaved?'saved':'to explore online'}</span>
          {activeFilters ? (
            <button className="text-button" onClick={resetFilters}><RotateCcw size={14}/> Reset filters</button>
          ) : (
            <span>Classics & international favourites</span>
          )}
        </div>

        {demoCatalogue && !moviesLoading && <p className="catalogue-note" role="status">Showing the sample movie collection while the movie service is offline. <button className="text-button" onClick={()=>setMovieRetry(value=>value+1)}>Reconnect</button></p>}
        {moviesLoading ? (
          <p className="catalogue-note" role="status">Loading movies…</p>
        ) : moviesError ? (
          <div className="empty" role="alert"><span><Info size={34}/></span><h2>Movies are unavailable right now.</h2><p>{moviesError}</p><button className="primary" onClick={()=>setMovieRetry(value=>value+1)}>Retry <ArrowRight size={17}/></button></div>
        ) : !apiMovies.length ? (
          <Empty icon={Film} title="No movies yet." text="The movie catalogue is empty. Check back after movies have been added."/>
        ) : filtered.length ? (
          <div className="movie-grid">
            {filtered.map(m=>(
              <article className="movie-card" key={m.id}>
                <div className="poster-wrap">
                  <button className="poster" onClick={()=>setDetail(m)} aria-label={'View details for '+m.title}>
                    <img src={m.imageUrl} alt={m.title+' theatrical poster'}/>
                    <span className="poster-shade"/>
                    <span className="format-tag">{m.language}</span>
                    <span className="poster-bottom">
                      <span>{m.genre}</span>
                      <i><ArrowUpRight size={23}/></i>
                    </span>
                  </button>
                  <button
                    className={'save-movie '+(saved.includes(m.id)?'is-saved':'')}
                    aria-label={(saved.includes(m.id)?'Unsave ':'Save ')+m.title}
                    aria-pressed={saved.includes(m.id)}
                    onClick={()=>toggleSaved(m.id)}
                  >
                    <Heart size={20} fill={saved.includes(m.id)?'currentColor':'none'}/>
                  </button>
                </div>

                <div className="movie-info">
                  <div className="movie-title">
                    <button onClick={()=>setDetail(m)}><h2>{m.title}</h2></button>
                    <span>{m.language}</span>
                  </div>
                  <p>{m.genre}<span>·</span>{duration(m.minutes)}</p>
                  <div className="film-meta"><span>{m.language}</span><span>{m.duration ? `${m.duration} min` : ''}</span></div>
                  <div className="online-actions">
                    <a className="primary" href={onlineLink(m)} target="_blank" rel="noopener noreferrer"><Play size={16}/>Find on Netflix<ArrowUpRight size={15}/></a>
                    <button className="secondary" onClick={()=>setDetail(m)}>More options</button>
                  </div>
                  <span className="fee-note">Search provider catalogue · availability not confirmed</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            icon={isSaved?Heart:Search}
            title={isSaved&&!saved.length?'Your favourites belong here.':'No films match your filters.'}
            text={isSaved&&!saved.length?'Tap the heart on a movie to save it for later.':'Try a different title, genre or screen format.'}
            action={isSaved&&!saved.length?'Explore movies':'Reset filters'}
            onAction={()=>{resetFilters();if(isSaved&&!saved.length)setTab('movies');}}
          />
        )}

        <div className="collection-note">
          <Ticket size={26}/>
          <div>
            <strong>A great film, wherever you watch.</strong>
            <p>Choose a Now Showing film to reserve sample seats, or explore official streaming options above.</p>
          </div>
          <button className="text-button" onClick={()=>setHelpOpen(true)}>Booking help <HelpCircle size={18}/></button>
        </div>
      </>
    );
  }

  return (
    <div className="site">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <button className="brand" onClick={()=>{setQuery('');navigate('now-showing');}} aria-label="CineBook home">
          <span className="brandmark"><Ticket size={24}/></span>
          <span className="brand-copy">
            <span className="brand-name">Cine<span className="brand-highlight">Book</span></span>
            <span className="brand-tag"><span className="brand-dot"></span>CINEMA, SIMPLY</span>
          </span>
        </button>
        <form className="header-search" role="search" onSubmit={e=>{e.preventDefault();if(tab!=='now-showing'&&tab!=='saved')navigate('movies');document.getElementById('main')?.scrollIntoView({block:'start'});}}>
          <Search size={18} className="search-icon" aria-hidden="true"/>
          <input
            type="search"
            aria-label="Search movies"
            placeholder={tab==='now-showing'?"Search films in cinemas…":"Search movies, genres, languages…"}
            value={query}
            onChange={e=>{setQuery(e.target.value);if(tab!=='movies'&&tab!=='saved'&&tab!=='now-showing')navigate('movies');}}
          />
          {query && <button type="button" className="clear-header-search" aria-label="Clear movie search" onClick={()=>setQuery('')}><X size={15}/></button>}
          <button type="submit" className="header-search-submit" aria-label="Show movie search results"><ArrowRight size={16}/></button>
        </form>
        <div className="header-actions">
          <button
            type="button"
            className="header-cinema-pill"
            onClick={()=>navigate('cinemas')}
            title="Browse cinema locations"
            aria-label="Locations"
          >
            <MapPin size={13} className="pin-icon"/>
            <span className="cinema-name">Locations</span>
            <ChevronDown size={12} className="chevron-icon"/>
          </button>

          <button
            type="button"
            className="theme-pill-toggle"
            onClick={()=>setTheme(theme==='dark'?'light':'dark')}
            title={`Switch to ${theme==='dark'?'light':'dark'} mode`}
            aria-label="Toggle dark mode"
          >
            <span className={`theme-icon ${theme==='light'?'active':''}`}>
              <Sun size={15}/>
            </span>
            <span className={`theme-icon ${theme==='dark'?'active':''}`}>
              <Moon size={15}/>
            </span>
          </button>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="account-chip" aria-label="Account menu">
                  <span className="account-avatar">{profile.name.slice(0,1).toUpperCase()}</span>
                  <div className="account-info">
                    <span className="account-name">{profile.name.split(' ')[0]}</span>
                    <span className="account-badge">Member</span>
                  </div>
                  <ChevronDown size={13} className="account-chevron"/>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="account-menu">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem onSelect={()=>navigate('profile')}><UserRound size={16}/>My profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={()=>navigate('bookings')}><Ticket size={16}/>My bookings</DropdownMenuItem>
                <DropdownMenuItem onSelect={()=>navigate('saved')}><Heart size={16}/>Saved films</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onSelect={logout}><LogOut size={16}/>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button className="header-login-btn" onClick={()=>setAuthOpen(true)}>
              <UserRound size={15}/>
              <span>Sign in</span>
            </button>
          )}
        </div>
      </header>

      <main id="main">
        <Tabs value={tab} onValueChange={navigate}>
          <div className="navrow">
            <TabsList className="navtabs">
              <TabsTrigger value="now-showing"><Ticket size={17}/>Now Showing</TabsTrigger>
              <TabsTrigger value="movies"><Film size={17}/>Movies</TabsTrigger>
              <TabsTrigger value="cinemas"><Building2 size={17}/>Cinemas</TabsTrigger>
              <TabsTrigger value="saved"><Heart size={17}/>Saved{saved.length>0&&<span className="count">{saved.length}</span>}</TabsTrigger>
              <TabsTrigger value="bookings"><Ticket size={17}/>My bookings{upcoming.length>0&&<span className="count">{upcoming.length}</span>}</TabsTrigger>
              {tab==='profile'&&<TabsTrigger value="profile"><UserRound size={17}/>Profile</TabsTrigger>}
            </TabsList>
            <span className="nav-location"><MapPin size={14}/>{CINEMAS.find(c=>c.id===cinema)?.city}, Sri Lanka</span>
          </div>

          {!storageAvailable && (
            <div className="notice storage-notice">
              <Info size={17}/>
              <p>Browser storage is unavailable. Your changes will last until you refresh; download tickets to keep them.</p>
            </div>
          )}

          <TabsContent value="now-showing">{renderNowShowing()}</TabsContent>
          <TabsContent value="movies">{renderCatalogue()}</TabsContent>
          <TabsContent value="saved">{renderCatalogue(true)}</TabsContent>

          {/* CINEMAS TAB */}
          <TabsContent value="cinemas">
            <section className="intro">
              <div>
                <span className="eyebrow">FIND YOUR BIG SCREEN</span>
                <h1>Sri Lankan Cinema Halls<span>.</span></h1>
                <p>Explore real cinemas in Sri Lanka. Choose a cinema and try seat selection here.</p>
              </div>
            </section>
            <div className="cinema-grid">
              {CINEMAS.map(c=>(
                <article className={'cinema-card '+(c.id===cinema?'current':'')} key={c.id}>
                  <div className="cinema-card-top">
                    <Building2 size={32}/>
                    <span>{c.id===cinema?'Your preferred cinema':c.city}</span>
                  </div>
                  <h2>{c.name}</h2>
                  <p>{c.description}</p>
                  <div className="cinema-facts">
                    <span><MapPin size={17}/>{c.address}</span>
                    <span><Film size={17}/>{c.operator}</span>
                  </div>
                  <div className="format-chips">{c.features.map(feature=><span key={feature}>{feature}</span>)}</div>
                  <div className="real-cinema-actions">
                    <button className="primary" onClick={()=>{setCinema(c.id);setQuery('');navigate('now-showing');}}>Choose a film <ArrowRight size={17}/></button>

                    <button className="text-button" disabled={c.id===cinema} onClick={()=>setCinema(c.id)}>{c.id===cinema?<><Check size={16}/>Preferred cinema</>:'Set as preferred'}</button>
                  </div>
                </article>
              ))}
            </div>

            <p className="helper"><Info size={16}/>Venue details checked 23 September 2026. Screen availability, seat layouts and ticket prices vary by show; confirm on the operator’s website. CineBook seat selection currently creates demo reservations only.</p>
          </TabsContent>

          {/* MY BOOKINGS TAB */}
          <TabsContent value="bookings">
            {backendError&&<div role="alert"><p>{backendError}</p><button className="secondary" onClick={()=>void refreshBookings()}>Retry loading bookings</button></div>}
            <section className="intro">
              <div>
                <span className="eyebrow">ALL YOUR MOVIE NIGHTS</span>
                <h1>My bookings<span>.</span></h1>
                <p>Your saved reservations. Demo bookings are not valid cinema tickets.</p>
              </div>
              <button className="secondary" onClick={()=>{setQuery('');navigate('now-showing');}}>Book another movie <ArrowRight size={17}/></button>
            </section>

            <div className="booking-stats">
              <div>
                <Ticket/>
                <span>Upcoming bookings<strong>{upcoming.length}</strong></span>
              </div>
              <div>
                <Armchair/>
                <span>Upcoming seats<strong>{upcoming.reduce((n,b)=>n+b.seats.length,0)}</strong></span>
              </div>
              <div>
                <CalendarDays/>
                <span>Total reservations<strong>{bookings.length}</strong></span>
              </div>
            </div>

            <div className="booking-filters">
              <Tabs value={bookingFilter} onValueChange={setBookingFilter}>
                <TabsList>
                  {['all','upcoming','past','cancelled'].map(v=>(
                    <TabsTrigger key={v} value={v}>{v[0].toUpperCase()+v.slice(1)}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <label className="search">
                <Search size={18}/>
                <input
                  aria-label="Search bookings"
                  placeholder="Movie, guest or booking ID"
                  value={bookingQuery}
                  onChange={e=>setBookingQuery(e.target.value)}
                />
                {bookingQuery && <button aria-label="Clear booking search" onClick={()=>setBookingQuery('')}><X size={16}/></button>}
              </label>
            </div>

            {visibleBookings.length ? (
              <div className="tickets">
                {visibleBookings.map(b=>{
                  const m = ALL_MOVIES.find(m=>m.id===b.movieId) || { title: 'Movie Ticket', image: '/images/dune.jpg', hall: 1 };
                  const status = bookingStatus(b);
                  return (
                    <article className="ticket-card" key={b.id}>
                      <img src={m.image} alt=""/>
                      <div className="ticket-card-content">
                        <div className="ticket-card-status">
                          <span className={'status '+status.toLowerCase()}>{status}</span>
                          <span className="payment-badge-chip">
                            {b.paymentMethod === 'card' ? <CreditCard size={12}/> : b.paymentMethod === 'lanka_qr' ? <Smartphone size={12}/> : <Store size={12}/>}
                            {b.mode==='api' ? 'Database · No payment' : b.mode==='demo' ? 'Demo · No payment' : b.paymentMethod === 'card' ? 'Card Paid' : b.paymentMethod === 'lanka_qr' ? 'LankaQR' : 'Pay at Counter'}
                          </span>
                        </div>
                        <h2>{m.title}</h2>
                        <p>{dateLabel(b.date)} · {b.time} · {cinemaName(b.cinema)}</p>
                        <p>
                          Seats <b>{b.seats.map(s => `${s} [${getSeatTier(s)}]`).join(', ')}</b> · {b.hall||('Hall '+m.hall)} · <b>{money(b.total)}</b>
                        </p>
                        {b.snacks && b.snacks.length > 0 && (
                          <div className="card-snacks-summary">
                            <Utensils size={13}/>
                            <span>{b.snacks.reduce((n, s) => n + s.qty, 0)} snacks added</span>
                          </div>
                        )}
                        {b.discount && b.discount > 0 && (
                          <div className="card-promo-tag">
                            <Tag size={13}/>
                            <span>{b.promoCode}: Saved {money(b.discount)}</span>
                          </div>
                        )}
                        <small className="booking-id">{b.id}</small>
                      </div>
                      <div className="ticket-card-actions">
                        <button className="secondary" onClick={()=>setViewTicket(b)}>
                          {b.mode==='api'?'View reservation':b.mode==='demo'?'View demo receipt':'View ticket'} <ArrowUpRight size={16}/>
                        </button>
                        <button className="text-button" onClick={()=>downloadTicket(b)}>
                          <Download size={15}/> Download
                        </button>
                        {status==='Upcoming' && (
                          <button className="text-button danger" onClick={()=>setCancelId(b.id)}>
                            Cancel booking
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <Empty
                icon={Ticket}
                title={bookings.length?'No matching reservations.':'Your next story is waiting.'}
                text={bookings.length?'Try another status or clear your search.':'Choose a film and reserve your favourite seats.'}
                action={bookings.length?'Show all bookings':'Explore movies'}
                onAction={()=>{setBookingFilter('all');setBookingQuery('');if(!bookings.length)navigate('movies');}}
              />
            )}

            {bookings.length > 0 && (
              <p className="helper">
                <Info size={16}/> Demo reservations stay in this browser tab. They are not valid for cinema entry.
              </p>
            )}
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <section className="intro">
              <div>
                <span className="eyebrow">YOUR CINEBOOK</span>
                <h1>My profile<span>.</span></h1>
                <p>A little more you. A better movie night.</p>
              </div>
            </section>
            {profile ? (
              <div className="profile-grid">
                <aside className="profile-card">
                  <span className="avatar large">{profile.name.charAt(0).toUpperCase()}</span>
                  <h2>{profile.name}</h2>
                  <p>{profile.email}</p>
                  <span className="demo-badge">CINEBOOK MEMBER</span>
                  <div className="profile-counts">
                    <span><strong>{saved.length}</strong>Saved films</span>
                    <span><strong>{bookings.length}</strong>Saved bookings</span>
                  </div>
                  <button className="secondary wide" onClick={logout}><LogOut size={17}/>Log out</button>
                </aside>
                <section className="profile-settings">
                  <h2>Profile & preferences</h2>
                  <form className="form-stack" onSubmit={async e=>{
                    e.preventDefault();
                    if(profileName.trim().length<2){toast.error('Please enter at least 2 characters.');return;}
                    const name = profileName.trim();
                    if(BOOKING_API_ENABLED){try{const result=await api<{profile:Profile}>('/auth/profile',{method:'POST',body:JSON.stringify({name})});setProfile(result.profile);toast.success('Your profile has been updated');}catch(e){toast.error((e as Error).message);}}
                    else{setProfile({...profile,name});toast.success('Your demo profile has been updated');}
                  }}>
                    <label>Display name
                      <input value={profileName} onChange={e=>setProfileName(e.target.value)} required minLength={2} maxLength={100}/>
                    </label>
                    <label>Email address
                      <input value={profile.email} readOnly aria-describedby="email-info"/>
                    </label>
                    <small id="email-info">Your email is used to identify your CineBook account.</small>
                    <button className="primary" type="submit">Save profile <Check size={17}/></button>
                  </form>
                  <div className="preference">
                    <div>
                      <strong>Dark mode</strong>
                      <p>Choose the look that feels right for you.</p>
                    </div>
                    <Switch aria-label="Profile dark mode" checked={theme==='dark'} onCheckedChange={v=>setTheme(v?'dark':'light')}/>
                  </div>
                  <div className="preference">
                    <div>
                      <strong>Preferred cinema</strong>
                      <p>Remembered on this device.</p>
                    </div>
                    <Choice label="Preferred cinema" value={cinema} onChange={setCinema} options={CINEMAS.map(c=>[c.id,c.name])}/>
                  </div>
                  <div className="notice">
                    <Info size={18}/><p>Your preferences and reservations are saved in this browser.</p>
                  </div>
                </section>
              </div>
            ) : (
              <Empty
                icon={UserRound}
                title="Make the experience yours."
                text="Sign in or create an account to manage your profile."
                action="Log in"
                onAction={()=>setAuthOpen(true)}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer>
        <div>
          <button className="footer-logo" onClick={()=>{setQuery('');navigate('now-showing');}}>CineBook<span>®</span></button>
          <p>{'Find your next night out. Or your next night in.'}</p>
        </div>
        <div className="footer-links">
          <button onClick={()=>setHelpOpen(true)}>Help</button>
          <button onClick={()=>setHelpOpen(true)}>Booking help</button>
        </div>
      </footer>

      {/* AUTH DIALOG */}
      <AuthDialog
        open={authOpen}
        onClose={()=>setAuthOpen(false)}
        onLogin={p=>{void refreshBookings();setProfile(p);setProfileName(p.name);toast.success(`Welcome, ${p.name.split(' ')[0]}`);}}
      />

      {seatMovie&&<CinemaSeatDialog key={seatMovie} movieId={seatMovie} initialCinema={cinema} profile={profile} bookings={bookings} onClose={()=>setSeatMovie(null)} onBooked={b=>{setBookings(old=>[b,...old.filter(x=>x.id!==b.id)]);toast.success('Reservation saved to the database');}} onHistory={()=>{setSeatMovie(null);setBookingFilter('all');setBookingQuery('');navigate('bookings');}}/>}
      {/* MOVIE DETAIL MODAL */}
      <Dialog open={!!detail} onOpenChange={v=>{if(!v)setDetail(null);}}>
        <DialogContent className="detail-modal">
          {detail && (
            <>
              <div className="detail-poster">
                <img src={detail.imageUrl} alt={detail.title+' poster'}/>
                <span className="format-tag">{detail.language}</span>
              </div>
              <div className="detail-content">
                <span className="eyebrow">THE CINEBOOK COLLECTION</span>
                <DialogTitle>{detail.title}</DialogTitle>
                <DialogDescription>
                  {detail.genre} · {duration(detail.minutes)} · {detail.language}
                </DialogDescription>
                <p className="synopsis">{detail.description}</p>
                <div className="detail-facts">
                  <span><Clock size={16}/>{duration(detail.minutes)}</span>
                  <span><Monitor size={16}/>Online catalogue</span>
                  <span>{detail.language} · {detail.collection} cinema</span>
                  <span className="rating-pill"><Star size={14} fill="#f59e0b" color="#f59e0b"/> {averageRating} / 5</span>
                </div>

                <div className="detail-action-row">
                  <button className="secondary" onClick={()=>toggleSaved(detail.id)}>
                    <Heart size={17} fill={saved.includes(detail.id)?'currentColor':'none'}/>
                    {saved.includes(detail.id)?'Saved to watchlist':'Save to watchlist'}
                  </button>
                </div>

                <div className="detail-showtimes online-provider-options">
                  <strong>Watch online</strong>
                  <p>Check the provider for availability in your country. You may need to sign in or pay to watch.</p>
                  <a className="primary" href={onlineLink(detail)} target="_blank" rel="noopener noreferrer">Search Netflix <ArrowUpRight size={16}/></a>
                  <a className="secondary" href={'https://www.primevideo.com/search/ref=atv_nb_sr?phrase='+encodeURIComponent(detail.title)} target="_blank" rel="noopener noreferrer">Search Prime Video <ArrowUpRight size={16}/></a>
                  <small>These links open official services. Search results do not guarantee this title is available.</small>
                </div>

                {/* AUDIENCE REVIEWS SECTION */}
                <div className="reviews-section">
                  <div className="reviews-header">
                    <div>
                      <h3>Audience Reviews</h3>
                      <p><Star size={14} fill="#f59e0b" color="#f59e0b" style={{display:'inline',marginRight:4}}/>
                        {averageRating} average rating ({movieReviews.length} community reviews)
                      </p>
                    </div>
                  </div>

                  {/* Submit Review Form */}
                  <form className="add-review-form" onSubmit={e=>handleAddReview(e, detail.id)}>
                    <div className="form-rating-row">
                      <span>Your rating:</span>
                      <div className="star-picker">
                        {[1, 2, 3, 4, 5].map(st=>(
                          <button
                            type="button"
                            key={st}
                            className={`star-btn ${reviewRating >= st ? 'active' : ''}`}
                            onClick={()=>setReviewRating(st)}
                            aria-label={`${st} stars`}
                          >
                            <Star size={18} fill={reviewRating >= st ? '#f59e0b' : 'none'} color="#f59e0b"/>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="review-inputs">
                      <input
                        placeholder="Your name"
                        value={reviewName}
                        onChange={e=>setReviewName(e.target.value)}
                        required
                        maxLength={50}
                      />
                      <input
                        placeholder="Share your thoughts about this movie..."
                        value={reviewComment}
                        onChange={e=>setReviewComment(e.target.value)}
                        required
                        maxLength={250}
                      />
                      <button type="submit" className="primary">Post Review</button>
                    </div>
                  </form>

                  {/* Reviews List */}
                  <div className="reviews-list">
                    {movieReviews.map(rev=>(
                      <div className="review-item" key={rev.id}>
                        <div className="review-meta">
                          <strong>{rev.author}</strong>
                          <div className="stars">
                            {Array.from({length: 5}, (_, i)=>(
                              <Star
                                key={i}
                                size={12}
                                fill={i < rev.rating ? '#f59e0b' : 'none'}
                                color="#f59e0b"
                              />
                            ))}
                          </div>
                          <small>{rev.date}</small>
                        </div>
                        <p>{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW TICKET DIALOG */}
      <Dialog open={!!viewTicket} onOpenChange={v=>{if(!v)setViewTicket(null);}}>
        <DialogContent className="ticket-modal">
          <DialogTitle>Your movie ticket</DialogTitle>
          <DialogDescription>Reservation details and download options. Demo receipts are not cinema tickets.</DialogDescription>
          {viewTicket && <TicketView booking={viewTicket}/>}
        </DialogContent>
      </Dialog>

      {/* CANCEL BOOKING DIALOG */}
      <AlertDialog open={!!cancelId} onOpenChange={v=>{if(!v)setCancelId(null);}}>
        <AlertDialogContent>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>Your selected seats and snacks will be released for this show.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction onClick={async()=>{
              const b = bookings.find(b=>b.id===cancelId);
              if(b && bookingStatus(b)==='Upcoming'){
                try{if(BOOKING_API_ENABLED&&b.mode==='api')await api('/bookings/'+encodeURIComponent(b.id)+'/cancel',{method:'POST'});}catch(e){toast.error((e as Error).message);return;}
                setBookings(old=>old.map(x=>x.id===b.id?{...x,cancelled:true}:x));
                toast.success('Booking cancelled. Your seats are available again.');
              }
              setCancelId(null);
            }}>
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* HELP DIALOG */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="help-modal">
          <DialogTitle>A little help, before the lights go down.</DialogTitle>
          <DialogDescription>Everything you need to try CineBook Sri Lanka.</DialogDescription>
          <Accordion type="single" collapsible>{[
            ['How do I book tickets?','Choose a cinema (Colombo, Kandy, Galle, Negombo, Jaffna), select a movie showtime, pick up to 8 seats (Standard or VIP Recliners), add cinema snacks, and choose your payment method.'],
            ['What are VIP Recliners and Seat Tiers?','Rows A and B are VIP luxury recliners (+LKR 600 surcharge), Rows C through E are Premium acoustic seats (+LKR 250 surcharge), and Rows F through H are Standard seats.'],
            ['Can I order popcorn and drinks?','Yes! Step 2 of the booking process lets you choose Caramel/Salted Popcorn, Nachos, Iced Milo, Coca-Cola, and value combos. You can also skip snacks if you prefer.'],
            ['How do promo codes work?','In Step 4 (Payment & Review), enter a code such as CINE10 for 10% off tickets, or STUDENT for LKR 300 off. Discounts will immediately reflect in your total payable.'],
            ['What payment methods are supported?','You can simulate paying by Credit/Debit Card (Visa/Mastercard), instant LankaQR (FriMi/Genie/Q+), or pay cash at the cinema counter.'],
            ['Is this a real cinema ticket?','No. Current in-site seat selections are demo reservations. They do not reserve seats with an operator or collect payments.'],
            ['Can I cancel a booking?','Open My bookings and click Cancel booking on any upcoming reservation. Your seats and concessions will be released immediately.']
          ].map(([q,a],i)=><AccordionItem value={String(i)} key={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion>
        </DialogContent>
      </Dialog>

      <Toaster theme={theme} position="bottom-right" closeButton richColors/>
    </div>
  );
}
