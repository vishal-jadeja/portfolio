'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { movies, verdicts, allTimeFavorites, currentFavorites, anticipatedMovies, type Movie } from '@/data/movies';

function Poster({ movie, priority = false }: { movie: Movie; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className="cinema-poster">
    {movie.poster && !failed ? <Image src={movie.poster} alt={`${movie.title} poster`} draggable={false} onDragStart={event => event.preventDefault()} fill sizes="(max-width: 639px) 45vw, 180px" priority={priority} loading={priority ? "eager" : "lazy"} onError={() => setFailed(true)} /> : <div className="cinema-artwork"><span aria-hidden="true">✦</span><strong>{movie.title}</strong><small>THE SCREEN ROOM</small></div>}
  </div>;
}

function Card({ movie, rank }: { movie: Movie; rank?: number }) {
  const verdict = movie.anticipated ? 'On my radar' : movie.verdict ?? (movie.favorite ? 'All-time favorite' : 'Not yet rated');
  const content = <>
    <Poster movie={movie} />
    {rank && <span className="cinema-rank" aria-label={`Favorite ${rank}`}>{String(rank).padStart(2, '0')}</span>}
    <div className="cinema-card-copy"><p className="cinema-meta">{movie.type}{movie.year ? ` · ${movie.year}` : ''}</p><h3>{movie.title}</h3>
      <span className={`cinema-verdict verdict-${verdicts.indexOf(movie.verdict!)}`}>{rank ? "All-time favorite" : verdict}</span>
    </div>
  </>;
  return <article className="cinema-card">{movie.imdb ? <a draggable={false} onDragStart={event => event.preventDefault()} href={`https://www.imdb.com/title/${movie.imdb}/`} target="_blank" rel="noopener noreferrer" aria-label={`${movie.title} — details on IMDb (opens in a new tab)`}>{content}</a> : <div>{content}</div>}</article>;
}

export default function Cinema() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [verdict, setVerdict] = useState('All verdicts');
  const [sort, setSort] = useState('Latest logged');
  const [limit, setLimit] = useState(24);
  const library = useMemo(() => movies.filter(movie => !movie.anticipated), []);
  const filtered = useMemo(() => library.filter(movie =>
    movie.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
    (type === 'All' || movie.type === type) &&
    (verdict === 'All verdicts' || (verdict === 'Not yet rated' ? !movie.verdict : movie.verdict === verdict))
  ).sort((a, b) => sort === 'A–Z' ? a.title.localeCompare(b.title) : sort === 'Favorites first' ? Number(!!b.favorite) - Number(!!a.favorite) || b.order - a.order : b.order - a.order), [library, query, type, verdict, sort]);
  const reset = () => { setQuery(''); setType('All'); setVerdict('All verdicts'); setSort('Latest logged'); setLimit(24); };

  return <div className="cinema-page">
    <header className="cinema-header site-gutter">
      <Link href="/#personal" className="cinema-back">← Back to portfolio</Link>
      <div className="cinema-heading-row"><div><p className="cinema-eyebrow">A PERSONAL COLLECTION</p><h1 className="section-title">The screen room<span className="cinema-period">.</span></h1></div><span className="cinema-ticket" aria-hidden="true">ADMIT ONE<br /><b>EST. 2022</b></span></div>
      <p className="section-description">Off the clock. On the screen.</p>
      <a className="cinema-profile-link" href="https://www.moctale.in/u/vishaljadeja" target="_blank" rel="noopener noreferrer" aria-label="Find me on Moctale (opens in a new tab)">
        Find me on Moctale
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
      </a>
    </header>

    <div className="site-gutter">
      <section className="cinema-feature" aria-label="A love for cinema">
        <div className="cinema-feature-art" aria-hidden="true">{[allTimeFavorites[3], allTimeFavorites[2], allTimeFavorites[0]].map(movie => <Poster key={movie.id} movie={movie} priority />)}</div>
        <div className="cinema-feature-copy"><span className="cinema-eyebrow">THE STORIES THAT STAY</span><p>Some worlds are<br />worth getting<br /><em>lost in.</em></p><a href="#collection" className="cinema-feature-link">Explore my collection <span aria-hidden="true">↗</span></a></div>
        <span className="cinema-feature-caption">FILMS · SERIES · A LITTLE ESCAPISM</span>
      </section>
      <div className="cinema-stats"><span><strong>{library.length}</strong> titles collected</span><span><strong>{String(allTimeFavorites.length).padStart(2, "0")}</strong> all-time favorites</span><span><strong>03</strong> on my radar</span></div>
    </div>

    <section className="cinema-section site-gutter" aria-labelledby="favorites-heading">
      <div className="cinema-section-top"><span className="cinema-eyebrow">01 / THE FOREVER FAVORITES</span><span aria-hidden="true">✦</span></div>
      <h2 id="favorites-heading" className="section-title">All-time favorites</h2><p className="section-description">The stories that stay with me. Start here for my personal favorites.</p>
      <div className="cinema-favorites">{allTimeFavorites.map((movie, i) => <Card key={movie.id} movie={movie} rank={i+1} />)}</div>
    </section>

    <section className="cinema-section site-gutter" aria-labelledby="current-heading">
      <div className="cinema-section-top"><span className="cinema-eyebrow">02 / IN THE SPOTLIGHT</span><span className="cinema-live">● CURRENT PICKS</span></div>
      <h2 id="current-heading" className="section-title">Current favorites</h2><p className="section-description">The worlds I’m into right now.</p>
      <div className="cinema-three">{currentFavorites.map(movie => <Card key={movie.id} movie={movie} />)}</div>
    </section>

    <section className="cinema-section cinema-anticipation site-gutter" aria-labelledby="radar-heading">
      <div className="cinema-section-top"><span className="cinema-eyebrow">03 / THE NEXT CHAPTER</span><span aria-hidden="true">↗</span></div>
      <h2 id="radar-heading" className="section-title">Can’t wait for these</h2><p className="section-description">Three reasons to look forward to the big screen.</p>
      <div className="cinema-three">{anticipatedMovies.map(movie => <Card key={movie.id} movie={movie} />)}</div>
    </section>

    <section id="collection" className="cinema-section site-gutter" aria-labelledby="collection-heading">
      <p className="cinema-eyebrow">04 / THE COMPLETE COLLECTION</p><h2 id="collection-heading" className="section-title">Roll the credits</h2><p className="section-description">Everything in my viewing journal. Find your next watch.</p>
      <div className="cinema-controls">
        <label className="cinema-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search movies and series" placeholder="Find a film or series…" value={query} onChange={e => { setQuery(e.target.value); setLimit(24); }} /><span className="cinema-search-count">{library.length} TITLES</span></label>
        <div className="cinema-filter-row"><div className="cinema-type-filter" role="group" aria-label="Filter by format">{['All', 'Movie', 'Series'].map(value => <button key={value} type="button" aria-pressed={type === value} onClick={() => {setType(value); setLimit(24);}}>{value === 'Movie' ? 'Movies' : value}</button>)}</div><label className="cinema-select"><span className="sr-only">Filter by verdict</span><select value={verdict} onChange={e => {setVerdict(e.target.value); setLimit(24);}}><option>All verdicts</option>{verdicts.map(value => <option key={value}>{value}</option>)}<option>Not yet rated</option></select></label></div>
        <div className="cinema-results-bar"><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'title' : 'titles'}{query ? ` for “${query}”` : ' to explore'}</p><label>Sort: <select aria-label="Sort collection" value={sort} onChange={e => {setSort(e.target.value); setLimit(24);}}><option>Latest logged</option><option>A–Z</option><option>Favorites first</option></select></label></div>
      </div>
      <div className="cinema-grid">{filtered.slice(0,limit).map(movie => <Card key={movie.id} movie={movie} />)}</div>
      {!filtered.length && <div className="cinema-empty"><span aria-hidden="true">◌</span><h3>No titles in this scene.</h3><p>Try another title or clear your filters.</p><button onClick={reset}>Reset filters</button></div>}
      {filtered.length > limit && <button className="cinema-more" onClick={() => setLimit(value => value + 24)}>Show more titles <span>{Math.min(24, filtered.length-limit)} more ↓</span></button>}
      <div className="cinema-legend"><p className="cinema-eyebrow">THE VERDICT, WITHOUT THE NUMBERS</p><div>{verdicts.map((value, i) => <span key={value} className={`cinema-verdict verdict-${i}`}>{value}</span>)}</div><p>Personal impressions, not critic scores. Repeat episodes and seasons share one card; the latest journal entry informs its verdict. Unrated titles stay unrated.</p><p>Poster artwork via IMDb. All artwork belongs to its respective owners.</p></div>
      <p className="cinema-endnote">Good stories stay with you long after the credits.<span aria-hidden="true">✦</span></p>
    </section>
  </div>;
}
