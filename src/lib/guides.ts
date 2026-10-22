/** Registro delle pagine: ogni file di `src/content/` viene caricato qui. */
import type { PageDef, Group } from './guide-types';
const mods = import.meta.glob<{ default: PageDef }>(['../content/calcolatori/*.ts', '../content/guide/*.ts', '../content/citta/*.ts'], { eager: true });
export const PAGES: PageDef[] = Object.entries(mods)
  .map(([file, m]) => {
    const g = m.default; const base = file.split('/').pop()!.replace(/\.ts$/, '');
    if (g.id !== base) throw new Error(`${file}: id « ${g.id} » diverso dal nome del file`);
    return g;
  })
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
export const GROUPS: Group[] = ['calcolo', 'incentivi', 'impianto', 'citta'];
export const pageById = (id: string) => PAGES.find((p) => p.id === id);
