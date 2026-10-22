import { makeRouter, type RouteDef } from './routes-core';
import { PAGES } from '../lib/guides';
export const LOCALES = ['it', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'it';
const R = (id: string, it: string, en: string, noindex = false): RouteDef<Locale> => ({ id, paths: { it: `/it/${it}/`, en: `/en/${en}/` }, ...(noindex ? { noindex } : {}) });
/** Pagine del nucleo. Simulatori, guide e città vengono da `src/content/` (lib/guides.ts). */
const CORE: RouteDef<Locale>[] = [
  { id: 'home', paths: { it: '/it/', en: '/en/' } },
  R('method', 'metodo', 'method'),
  R('about', 'chi-siamo', 'about'),
  R('widget', 'widget', 'widget', true),
  R('contact', 'contatti', 'contact', true),
  R('editorial', 'principi-editoriali', 'editorial-policy', true),
  R('privacy', 'privacy', 'privacy', true),
  R('terms', 'note-legali', 'legal-notice', true),
  R('cookies', 'cookie', 'cookies', true),
];
export const ROUTES: RouteDef<Locale>[] = [CORE[0], ...PAGES.map((p) => R(p.id, p.it.slug, p.en.slug)), ...CORE.slice(1)];
export const { NOINDEX_PATHS, route, altPaths } = makeRouter(LOCALES, ROUTES);
