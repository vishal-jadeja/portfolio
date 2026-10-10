import type { Metadata } from 'next';
import PortfolioShell from '@/components/PortfolioShell';
import Cinema from '@/components/cinema/Cinema';
import { SITE_URL, pageRobots, pageSocial } from '@/lib/seo';
import './movies.css';

const DESCRIPTION = 'Off the clock, on the screen. A personal collection of movies, series, all-time favorites, and the stories I’m looking forward to.';

export const metadata: Metadata = {
  title: 'Movies & series',
  description: DESCRIPTION,
  keywords: ['movie ratings', 'series recommendations', 'favorite movies', 'Vishal Jadeja'],
  alternates: { canonical: `${SITE_URL}/movies` },
  ...pageSocial({ path: '/movies', title: 'Movies & series', description: DESCRIPTION }),
  robots: pageRobots(),
};

export default function MoviesPage() {
  return <PortfolioShell pathname="/movies"><Cinema /></PortfolioShell>;
}
