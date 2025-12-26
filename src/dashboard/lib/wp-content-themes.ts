/**
 * Theme-specific styles for WordPress content rendering
 * Matches the Catalyst, Stencil, and Makeswift theme patterns
 */

export type WPContentTheme = 'catalyst' | 'stencil' | 'makeswift';

export interface WPContentThemeConfig {
  // Container styles
  container: string;

  // Typography
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  paragraph: string;
  link: string;

  // Block elements
  blockquote: string;
  codeBlock: string;
  inlineCode: string;
  list: string;
  listItem: string;

  // Media
  image: string;
  figure: string;
  figcaption: string;

  // Gutenberg blocks
  wpButton: string;
  wpColumns: string;
  wpColumn: string;
  wpSeparator: string;
  wpQuote: string;
  wpPullquote: string;
}

const catalystTheme: WPContentThemeConfig = {
  container: 'prose prose-invert prose-slate max-w-none',

  heading1: 'text-3xl font-bold tracking-tight text-slate-100 mb-4 mt-8 first:mt-0',
  heading2: 'text-2xl font-semibold tracking-tight text-slate-100 mb-3 mt-6',
  heading3: 'text-xl font-semibold text-slate-100 mb-2 mt-5',
  heading4: 'text-lg font-medium text-slate-200 mb-2 mt-4',
  paragraph: 'text-slate-300 leading-relaxed mb-4',
  link: 'text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors',

  blockquote: 'border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4',
  codeBlock: 'bg-slate-800 rounded-xl p-4 overflow-x-auto text-sm font-mono text-slate-300 my-4',
  inlineCode: 'bg-slate-800 rounded px-1.5 py-0.5 text-sm font-mono text-slate-300',
  list: 'list-disc list-inside space-y-1 text-slate-300 my-4 ml-4',
  listItem: 'text-slate-300',

  image: 'rounded-xl shadow-lg max-w-full h-auto my-6',
  figure: 'my-6',
  figcaption: 'text-center text-sm text-slate-500 mt-2',

  wpButton: 'inline-block rounded-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 font-medium transition-colors',
  wpColumns: 'grid gap-6 my-6',
  wpColumn: '',
  wpSeparator: 'border-t border-slate-700 my-8',
  wpQuote: 'border-l-4 border-blue-500 pl-4 italic text-slate-300 my-4',
  wpPullquote: 'border-y border-slate-600 py-4 text-xl italic text-center text-slate-300 my-8',
};

const stencilTheme: WPContentThemeConfig = {
  container: 'prose prose-invert max-w-none',

  heading1: 'text-3xl font-bold text-slate-100 mb-4 mt-8 first:mt-0',
  heading2: 'text-2xl font-bold text-slate-100 mb-3 mt-6',
  heading3: 'text-xl font-bold text-slate-100 mb-2 mt-5',
  heading4: 'text-lg font-semibold text-slate-200 mb-2 mt-4',
  paragraph: 'text-slate-300 leading-relaxed mb-4',
  link: 'text-blue-500 hover:text-blue-400 underline transition-colors',

  blockquote: 'border-l-4 border-blue-500 pl-4 italic text-slate-400 my-4 bg-slate-800/50 py-2',
  codeBlock: 'bg-slate-900 border border-slate-700 rounded p-4 overflow-x-auto text-sm font-mono text-slate-300 my-4',
  inlineCode: 'bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-sm font-mono text-slate-300',
  list: 'list-disc list-outside space-y-2 text-slate-300 my-4 ml-6',
  listItem: 'text-slate-300',

  image: 'rounded shadow-md max-w-full h-auto my-6 border border-slate-700',
  figure: 'my-6',
  figcaption: 'text-center text-sm text-slate-500 mt-2 italic',

  wpButton: 'inline-block rounded bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-medium transition-colors',
  wpColumns: 'grid gap-4 my-6',
  wpColumn: 'bg-slate-800/30 p-4 rounded',
  wpSeparator: 'border-t border-slate-600 my-8',
  wpQuote: 'border-l-4 border-blue-500 pl-4 italic text-slate-300 my-4',
  wpPullquote: 'border-y border-blue-500 py-6 text-xl italic text-center text-slate-200 my-8',
};

const makeswiftTheme: WPContentThemeConfig = {
  container: 'prose prose-invert prose-pink max-w-none',

  heading1: 'text-4xl font-bold tracking-tight text-slate-100 mb-6 mt-10 first:mt-0',
  heading2: 'text-3xl font-bold tracking-tight text-slate-100 mb-4 mt-8',
  heading3: 'text-2xl font-semibold text-slate-100 mb-3 mt-6',
  heading4: 'text-xl font-medium text-slate-200 mb-2 mt-5',
  paragraph: 'text-slate-300 leading-relaxed mb-5 text-lg',
  link: 'text-pink-400 hover:text-pink-300 underline underline-offset-4 decoration-pink-400/50 hover:decoration-pink-300 transition-all',

  blockquote: 'border-l-4 border-pink-500 pl-6 italic text-slate-300 my-6 text-lg',
  codeBlock: 'bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 overflow-x-auto text-sm font-mono text-slate-300 my-6 shadow-lg',
  inlineCode: 'bg-slate-800 rounded-lg px-2 py-1 text-sm font-mono text-pink-300',
  list: 'list-disc list-inside space-y-2 text-slate-300 my-5 ml-4 text-lg',
  listItem: 'text-slate-300',

  image: 'rounded-2xl shadow-2xl max-w-full h-auto my-8',
  figure: 'my-8',
  figcaption: 'text-center text-sm text-slate-500 mt-3',

  wpButton: 'inline-block rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white px-8 py-3 font-semibold transition-all shadow-lg hover:shadow-xl',
  wpColumns: 'grid gap-8 my-8',
  wpColumn: '',
  wpSeparator: 'border-t border-slate-700/50 my-10',
  wpQuote: 'border-l-4 border-pink-500 pl-6 italic text-slate-200 my-6 text-lg',
  wpPullquote: 'border-y border-pink-500/50 py-8 text-2xl italic text-center text-slate-200 my-10 font-light',
};

export const wpContentThemes: Record<WPContentTheme, WPContentThemeConfig> = {
  catalyst: catalystTheme,
  stencil: stencilTheme,
  makeswift: makeswiftTheme,
};

export function getWPContentTheme(theme: WPContentTheme): WPContentThemeConfig {
  return wpContentThemes[theme] || wpContentThemes.catalyst;
}
