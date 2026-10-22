import type { Locale } from './routes';
const it = {
  updatedOn: 'Aggiornato il', editorialPolicy: 'Principi editoriali', contactLabel: 'Contatti', reviewedBy: 'Verificato da',
  skipToContent: 'Vai al contenuto', mainNav: 'Navigazione principale', breadcrumbLabel: 'Percorso', breadcrumbHome: 'Inizio', menuOpen: 'Apri il menu',
  faqTitle: 'Le domande dei lettori', relatedCalculators: 'Continua a calcolare', sourcesTitle: 'Norme e dati', writtenBy: 'A cura di',
  asOf: 'Dati', lastUpdated: 'letti il', footerValidated: 'Produzione PVGIS per 7 896 comuni, autoconsumo dai consumi orari ARERA, prezzi del ritiro dedicato GSE', footerBrowser: 'Il calcolo avviene nel vostro browser · nessun dato viene salvato o inviato · gratuito',
  footerDisclaimer: 'Resa Fotovoltaico è un servizio indipendente di Radif Partners. Non vendiamo impianti e non passiamo richieste a installatori. I risultati sono stime indicative; fanno fede il vostro contratto, il GSE e l\'Agenzia delle Entrate.', footerPopular: '', notFound: 'A questo indirizzo non c\'è nessuna pagina.',
  readMore: 'Continua a leggere',
};
const en: typeof it = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Questions readers ask', relatedCalculators: 'Keep calculating', sourcesTitle: 'Laws and data', writtenBy: 'Written by',
  asOf: 'Data', lastUpdated: 'read on', footerValidated: 'PVGIS output for 7,896 comuni, self-consumption from ARERA hourly household data, GSE ritiro dedicato prices', footerBrowser: 'Everything is calculated in your browser · no input is stored or sent · free',
  footerDisclaimer: 'Resa Fotovoltaico is an independent service by Radif Partners. We sell no systems and pass no requests to installers. Results are estimates only; your contract, the GSE and the Agenzia delle Entrate have the final word.', footerPopular: '', notFound: 'There is no page at this address.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : it; }
