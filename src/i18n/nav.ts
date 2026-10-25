import { route, type Locale } from './routes';
import { PAGES, pageById, GROUPS } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  it: { home: 'Calcolo fotovoltaico', method: 'Come calcoliamo', about: 'Chi siamo', widget: 'Inserisci il calcolatore', contact: 'Contatti', editorial: 'Principi editoriali', privacy: 'Privacy', terms: 'Note legali', cookies: 'Cookie' },
  en: { home: 'Solar calculator', method: 'How we calculate', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
const GROUP_LABEL: Record<Locale, Record<Group, string>> = {
  it: { calcolo: 'Calcolatori', incentivi: 'Incentivi e vendita', impianto: 'Impianto e costi', citta: 'Resa nelle città' },
  en: { calcolo: 'Calculators', incentivi: 'Incentives and export', impianto: 'System and costs', citta: 'Yield in major cities' },
};
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? pageById(id)?.[lang].nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export const groupLabel = (g: Group, lang: Locale) => GROUP_LABEL[lang][g];
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: GROUP_LABEL[lang][g], links: g === 'calcolo' ? [link('home', lang), ...inGroup(g, lang)] : inGroup(g, lang) })).filter((c) => c.links.length);
}
// Methode : liee en bas de page, hors du menu du haut pour qu'il tienne sur une ligne.
export const navDirect = (_lang: Locale): NavLink[] => [];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.map((g) => ({ label: GROUP_LABEL[lang][g], links: g === 'calcolo' ? [link('home', lang), ...inGroup(g, lang)] : inGroup(g, lang) })).filter((c) => c.links.length),
  { label: lang === 'it' ? 'Questo sito' : 'This site', links: ['method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
export const popularLinks = (_lang: Locale): NavLink[] => [];
