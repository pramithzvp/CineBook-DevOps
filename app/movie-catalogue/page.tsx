'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Film, RotateCcw } from 'lucide-react';
import { getAllMovies } from '@/src/services/movieService.js';

type MovieRecord = {
  id: number;
  title: string;
  genre: string;
  language: string;
  duration: number;
  description: string;
  imageUrl: string | null;
};

const fallbackImage = '/images/dune.jpg';

export default function MovieCataloguePage() {
  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAllMovies()
      .then((items: MovieRecord[]) => {
        if (active) setMovies(items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load movies.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [retry]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-[5.5%] py-8">
      <a className="text-button mb-6" href="/"><ArrowLeft size={16}/> Back to CineBook</a>
      <section className="intro">
        <div>
          <span className="eyebrow">SPRING BOOT CATALOGUE</span>
          <h1>Movie library<span>.</span></h1>
          <p>Titles loaded from the CineBook movie service.</p>
        </div>
        <div className="programme-label"><span>LIVE API</span><p>Connected to localhost:8080</p></div>
      </section>

      {loading ? (
        <p className="catalogue-note" role="status">Loading movies…</p>
      ) : error ? (
        <div className="empty" role="alert">
          <span><Film size={34}/></span><h2>Movies are unavailable right now.</h2><p>{error}</p>
          <button className="primary" onClick={() => setRetry(value => value + 1)}>Retry <RotateCcw size={16}/></button>
        </div>
      ) : movies.length === 0 ? (
        <div className="empty"><span><Film size={34}/></span><h2>No movies yet.</h2><p>The backend catalogue does not contain any movies.</p></div>
      ) : (
        <div className="movie-grid">
          {movies.map(movie => {
            const image = movie.imageUrl?.trim() || fallbackImage;
            return (
              <article className="movie-card" key={movie.id}>
                <div className="poster-wrap">
                  <div className="poster">
                    <img src={image} alt={`${movie.title} poster`} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}/>
                    <span className="poster-shade"/>
                    <span className="format-tag">{movie.language}</span>
                    <span className="poster-bottom"><span>{movie.genre}</span></span>
                  </div>
                </div>
                <div className="movie-info">
                  <div className="movie-title"><h2>{movie.title}</h2><span>{movie.language}</span></div>
                  <p>{movie.genre}<span>·</span>{movie.duration} min</p>
                  <p className="catalogue-note">{movie.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
