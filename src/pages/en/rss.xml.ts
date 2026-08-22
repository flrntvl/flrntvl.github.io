import type { APIRoute } from 'astro';
import { feedFor } from '@/lib/rss-feed';

export const GET: APIRoute = (context) => feedFor(context, 'en');
