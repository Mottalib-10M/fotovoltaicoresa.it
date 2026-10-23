/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://fotovoltaicoresa.it";
export const SITE_NAMES: Record<string, string> = {"it": "Resa Fotovoltaico", "en": "Resa Fotovoltaico"};
export const LANG_TAGS: Record<string, string> = {"it": "it-IT", "en": "en-IT"};
export const OG_LOCALES: Record<string, string> = {"it": "it_IT", "en": "en_GB"};
export const LOCALE_TAG = 'it-IT';
/** Une locale par langue (RECETTE §4) : l'anglais écrit 1,234.5 et non 1.234,5. */
export const LOCALE_BY_LANG: Record<string, string> = { it: 'it-IT', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-22';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"it": "Editore di un calcolatore indipendente del fotovoltaico domestico, comune per comune, senza preventivi né contatti", "en": "Publisher of an independent home solar calculator for every Italian comune, with no quotes and no contact forms"};
export const AUTHOR_DESC: Record<string, string> = {"it": "Radif Partners ha interrogato PVGIS, il servizio solare del Centro comune di ricerca della Commissione europea, per tutti i 7 896 comuni italiani, e incrocia quella produzione con i consumi orari delle famiglie misurati da ARERA, i prezzi mensili del ritiro dedicato pubblicati dal GSE e la detrazione indicata dall'Agenzia delle Entrate. Nessun impianto in vendita, nessun installatore da contattare.", "en": "Radif Partners queried PVGIS, the European Commission Joint Research Centre's solar service, for all 7,896 Italian comuni, and combines that output with ARERA's hourly household consumption data, the GSE's monthly ritiro dedicato prices and the tax deduction set out by the Agenzia delle Entrate. Nothing is sold and no installer will call you."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"it": ["Produzione fotovoltaica per comune (PVGIS)", "Autoconsumo e accumulo domestico", "Ritiro dedicato GSE e prezzi minimi garantiti", "Detrazione per ristrutturazione applicata al fotovoltaico", "Comunità energetiche rinnovabili e tariffa premio"], "en": ["Solar output by Italian comune (PVGIS)", "Self-consumption and home batteries in Italy", "GSE ritiro dedicato and guaranteed minimum prices", "Italian home-renovation tax deduction for solar", "Italian renewable energy communities and the premium tariff"]};
export const CONTACT_EMAIL = "contatti@fotovoltaicoresa.it";
export const THEME_COLOR = '#A8232B';
export const LOGO_SYMBOL = 'PV';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = '';
export const INDEXNOW_KEY = '08957b6c48b774c784bc7c5b441cd678';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',  // publication à titre personnel, comme les autres sites du portefeuille
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "Francia / France",
  phone: '',
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "Partita IVA / VAT",
  vatNumber: '',
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
