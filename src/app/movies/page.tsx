import type { Metadata } from 'next';
import PortfolioShell from '@/components/PortfolioShell';
import Cinema from '@/components/cinema/Cinema';
import { SITE_URL, pageRobots } from '@/lib/seo';
import './movies.css';

export const metadata: Metadata = {
  title: 'Movies & series',
  description: 'Off the clock, on the screen. A personal collection of movies, series, all-time favorites, and the stories I’m looking forward to.',
  alternates: { canonical: `${SITE_URL}/movies` },
  robots: pageRobots(),
};

export default function MoviesPage() {
  return <PortfolioShell><Cinema /></PortfolioShell>;
}
