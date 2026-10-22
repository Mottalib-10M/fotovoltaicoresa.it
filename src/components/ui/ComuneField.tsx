/**
 * Campo « comune » con suggerimenti: l'elenco dei 7 896 comuni (public/data/comuni.json, PVGIS per comune) si
 * carica solo al primo focus, perché pesa più del resto della pagina. Il testo digitato non viene mai riscritto
 * durante la digitazione (check-saisie) ; alla scelta di un suggerimento il campo mostra « Nome (SIGLA) ».
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { Luogo } from '../../lib/engine/dati';

type Row = [string, string, number, number, number];
let cache: Promise<Row[]> | null = null;
const carica = () => (cache ??= fetch('/data/comuni.json').then((r) => r.json() as Promise<Row[]>).catch(() => { cache = null; return []; }));
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const etichetta = (l: Luogo) => `${l.nome} (${l.sigla})`;

interface Props { id: string; label: string; value: Luogo; onChange: (l: Luogo) => void; help?: string; lang?: string }

export default function ComuneField({ id, label, value, onChange, help, lang = 'it' }: Props) {
  const [text, setText] = useState(etichetta(value));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { setText(etichetta(value)); }, [value.nome, value.sigla]);
  const q = norm(text.replace(/\([A-Z]{2}\)\s*$/, ''));
  const match: Row[] = [];
  if (rows && q && text !== etichetta(value)) {
    for (const r of rows) if (norm(r[0]).startsWith(q)) { match.push(r); if (match.length >= 8) break; }
    if (match.length < 8) for (const r of rows) if (!match.includes(r) && norm(r[0]).includes(q)) { match.push(r); if (match.length >= 8) break; }
  }
  const scegli = (r: Row) => { const l = { nome: r[0], sigla: r[1], reg: r[2], ey: r[3] }; onChange(l); setText(etichetta(l)); setOpen(false); };
  useEffect(() => {
    const fuori = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fuori); return () => document.removeEventListener('mousedown', fuori);
  }, []);
  const vuoto = rows !== null && q.length > 0 && text !== etichetta(value) && match.length === 0;
  return (
    <div ref={box} className="grid grid-rows-subgrid row-span-3 content-start gap-y-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-navy-700">{label}</label>
      <div className="relative self-start">
        <input id={id} type="text" autoComplete="off" spellCheck={false} role="combobox" aria-expanded={open && match.length > 0} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={open && match[act] ? `${listId}-${act}` : undefined} value={text}
          onFocus={(e) => { e.currentTarget.select(); if (!rows) carica().then(setRows); }}
          onChange={(e) => { setText(e.target.value); setOpen(true); setAct(0); if (!rows) carica().then(setRows); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setAct((a) => Math.min(a + 1, Math.max(match.length - 1, 0))); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter') { if (match[act]) { e.preventDefault(); scegli(match[act]); } }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
        {open && match.length > 0 && (
          <ul id={listId} role="listbox" className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-auto rounded-lg border border-navy-200 bg-white py-1 shadow-lg">
            {match.map((r, i) => (
              <li key={`${r[0]}-${r[1]}`} id={`${listId}-${i}`} role="option" aria-selected={i === act}
                onMouseDown={(e) => { e.preventDefault(); scegli(r); }} onMouseEnter={() => setAct(i)}
                className={`flex cursor-pointer justify-between gap-3 px-3 py-2 text-sm ${i === act ? 'bg-accent-50 text-navy-900' : 'text-navy-800'}`}>
                <span>{r[0]} <span className="text-navy-600">({r[1]})</span></span>
                <span className="tabular-nums text-navy-600">{new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'it-IT').format(r[3])} kWh/kWp</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1 text-xs text-navy-600" role={vuoto ? 'status' : undefined}>{vuoto ? (lang === 'en' ? 'No comune with this name: try fewer letters.' : 'Nessun comune con questo nome: provate con meno lettere.') : help}</p>
    </div>
  );
}
