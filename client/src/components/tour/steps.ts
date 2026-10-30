export interface TourStep {
  /** Matches an element with data-tour="<target>". Omit for a centered card. */
  target?: string;
  route?: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/dashboard',
    title: 'Welcome',
    body: 'Upload invoices and receipts, check what was read, export clean data. Six quick stops.',
  },
  {
    route: '/dashboard',
    target: 'upload',
    title: 'Upload',
    body: 'PDFs or photos, up to 20 at once. You can also drop files anywhere on the page.',
  },
  {
    route: '/dashboard',
    target: 'kpis',
    title: 'At a glance',
    body: 'Spend, documents waiting for review, and how confident extraction was.',
  },
  {
    route: '/invoices',
    target: 'status-tabs',
    title: 'Track progress',
    body: 'Documents are read and extracted in the background. Filter by status.',
  },
  {
    route: '/invoices',
    target: 'invoice-table',
    title: 'Review and approve',
    body: 'Open a document to compare extracted fields with the original, fix anything, then approve.',
  },
  {
    route: '/exports',
    target: 'export-card',
    title: 'Export',
    body: 'Download approved invoices as CSV or Excel for your accounting tool.',
  },
  {
    route: '/issued',
    target: 'nav-issued',
    title: 'Create and send',
    body: 'Make an invoice for a customer and send it as a PDF via your own Gmail account.',
  },
  {
    target: 'help',
    title: 'That’s it',
    body: 'Replay this tour any time from here.',
  },
];
