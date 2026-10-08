import catalog from './movies.json';

export type Verdict = 'Masterpiece' | 'Go for it' | 'Timepass' | 'Skip';
export type Movie = {
  id: string;
  title: string;
  type: 'Movie' | 'Series';
  year?: number;
  poster?: string;
  imdb?: string;
  posterSource?: string;
  verdict: Verdict | null;
  order: number;
  loggedEntries: number;
  favorite?: boolean;
  current?: boolean;
  anticipated?: boolean;
};
export const movies = catalog as Movie[];
export const verdicts: Verdict[] = ['Masterpiece', 'Go for it', 'Timepass', 'Skip'];
const orderedTitles = (titles: string[]) => titles
  .map(title => movies.find(movie => movie.title === title))
  .filter((movie): movie is Movie => movie !== undefined);

export const allTimeFavorites = orderedTitles(['Game of Thrones', 'Breaking Bad', 'Dark', 'Interstellar', 'Avengers: Infinity War', 'Stranger Things', 'Fight Club']);
export const currentFavorites = orderedTitles(['Lanterns', 'House of the Dragon', 'IT: Welcome to Derry']);
export const anticipatedMovies = movies.filter(movie => movie.anticipated);
