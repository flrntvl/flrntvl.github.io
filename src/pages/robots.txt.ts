/*
 * robots.txt : tout est ouvert à l'exploration ; indique où trouver le sitemap.
 * Les pages à ne pas indexer (404, « non traduit ») portent déjà <meta name="robots" content="noindex">.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('`site` doit être défini dans astro.config.mjs pour générer robots.txt.');
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
