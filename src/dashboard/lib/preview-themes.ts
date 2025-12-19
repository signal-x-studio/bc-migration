import type { PreviewPathId } from './types';

/**
 * Authentic theme configurations based on actual source code:
 * - Catalyst: bigcommerce/catalyst Soul design system
 * - Stencil: bigcommerce/cornerstone theme SCSS
 * - Makeswift: makeswift.com styling patterns
 */

export interface PathTheme {
  // Core identity
  name: string;
  description: string;

  // Card styling
  cardWrapper: string;
  cardImageContainer: string;
  cardImageStyle: string;
  cardBody: string;
  cardTitle: string;
  cardSubtitle: string;

  // Image configuration
  imageAspect: string;
  imageHover: string;
  placeholderStyle: string;

  // Price styling
  priceWrapper: string;
  priceRegular: string;
  priceSale: string;
  priceOriginal: string;

  // Badge styling
  badgeWrapper: string;
  badgeSale: string;
  badgeOutOfStock: string;

  // Button styling
  buttonPrimary: string;
  buttonSecondary: string;

  // Grid layout
  gridWrapper: string;
  gridColumns: string;

  // PDP specific
  pdpLayout: string;
  pdpGallery: string;
  pdpInfo: string;

  // Variant selectors
  variantWrapper: string;
  variantSwatch: string;
  variantSwatchSelected: string;
  variantDropdown: string;

  // Rating
  ratingWrapper: string;
  ratingStar: string;
  ratingStarEmpty: string;

  // General colors (for UI elements)
  colors: {
    bg: string;
    bgHover: string;
    border: string;
    borderHover: string;
    text: string;
    accent: string;
    ring: string;
  };
}

export const PATH_THEMES: Record<PreviewPathId, PathTheme> = {
  /**
   * Catalyst - Soul Design System
   * Source: github.com/bigcommerce/catalyst/core/vibes/soul
   *
   * Key patterns:
   * - Minimal, neutral aesthetic
   * - rounded-xl to rounded-2xl corners
   * - Aspect ratios: 5:6, 3:4, 1:1
   * - Scale 1.1 on image hover
   * - HSL-based color system
   * - Pill-shaped buttons
   */
  catalyst: {
    name: 'Catalyst',
    description: 'Headless React/Next.js storefront',

    // Card - Based on Soul ProductCard component
    cardWrapper: 'group flex flex-col gap-3 min-w-0 max-w-md',
    cardImageContainer: 'relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800',
    cardImageStyle: 'w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110',
    cardBody: 'flex flex-col gap-1 px-1 text-sm',
    cardTitle: 'line-clamp-2 font-semibold text-neutral-900 dark:text-neutral-100',
    cardSubtitle: 'text-sm text-neutral-600 dark:text-neutral-400',

    imageAspect: 'aspect-[5/6]',
    imageHover: 'group-hover:scale-110',
    placeholderStyle: 'bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center',

    // Price - Based on Soul PriceLabel component
    priceWrapper: 'flex items-center gap-2',
    priceRegular: 'font-semibold text-neutral-900 dark:text-neutral-100',
    priceSale: 'font-semibold text-neutral-900 dark:text-neutral-100',
    priceOriginal: 'font-normal line-through opacity-50 text-neutral-600',

    // Badge - Based on Soul Badge component
    badgeWrapper: 'absolute left-3 top-3',
    badgeSale: 'px-2 py-0.5 rounded text-xs uppercase tracking-tight font-mono bg-neutral-900/10 text-neutral-900 dark:bg-white/20 dark:text-white',
    badgeOutOfStock: 'px-2 py-0.5 rounded text-xs uppercase tracking-tight font-mono bg-red-100 text-red-800',

    // Button - Based on Soul Button component (pill shape default)
    buttonPrimary: 'inline-flex items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 text-white font-semibold px-6 py-3 transition-all hover:bg-white hover:text-neutral-900',
    buttonSecondary: 'inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 font-semibold px-6 py-3 transition-all hover:bg-neutral-100',

    // Grid
    gridWrapper: 'grid gap-6',
    gridColumns: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',

    // PDP
    pdpLayout: 'grid md:grid-cols-2 gap-8 lg:gap-12',
    pdpGallery: 'space-y-4',
    pdpInfo: 'space-y-6',

    // Variants - Catalyst uses pill-shaped swatches
    variantWrapper: 'space-y-4',
    variantSwatch: 'w-8 h-8 rounded-full border-2 border-transparent ring-2 ring-neutral-200 hover:ring-neutral-400 transition-all',
    variantSwatchSelected: 'ring-neutral-900 ring-offset-2',
    variantDropdown: 'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900',

    // Rating
    ratingWrapper: 'flex items-center gap-1',
    ratingStar: 'w-4 h-4 text-yellow-400 fill-current',
    ratingStarEmpty: 'w-4 h-4 text-neutral-300',

    colors: {
      bg: 'bg-neutral-100',
      bgHover: 'hover:bg-neutral-200',
      border: 'border-neutral-200',
      borderHover: 'hover:border-neutral-900',
      text: 'text-neutral-900',
      accent: 'bg-neutral-900',
      ring: 'ring-neutral-900',
    },
  },

  /**
   * Stencil - Cornerstone Theme
   * Source: github.com/bigcommerce/cornerstone
   *
   * Key patterns:
   * - Traditional e-commerce aesthetic
   * - .card, .card-figure, .card-body classes
   * - object-fit: contain for images
   * - Hover reveals figcaption
   * - Primary color buttons
   * - Center text on mobile, left on desktop
   */
  stencil: {
    name: 'Stencil',
    description: 'Native BigCommerce theme (Cornerstone)',

    // Card - Based on Cornerstone _cards.scss
    cardWrapper: 'group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-blue-600 transition-all duration-150',
    cardImageContainer: 'relative overflow-hidden p-[3px] bg-neutral-50 dark:bg-neutral-800',
    cardImageStyle: 'w-full max-h-full object-contain',
    cardBody: 'p-4 text-center sm:text-left',
    cardTitle: 'text-base font-normal text-neutral-800 dark:text-neutral-200 hover:text-blue-600 transition-colors',
    cardSubtitle: 'text-sm text-neutral-500 dark:text-neutral-400 mt-1',

    imageAspect: 'aspect-square',
    imageHover: '',
    placeholderStyle: 'bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400',

    // Price - Based on Cornerstone price.html
    priceWrapper: 'mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2',
    priceRegular: 'text-lg font-bold text-neutral-900 dark:text-white',
    priceSale: 'text-lg font-bold text-red-600',
    priceOriginal: 'text-sm text-neutral-500 line-through',

    // Badge - Based on Cornerstone badge patterns
    badgeWrapper: 'absolute top-2 left-2 z-10',
    badgeSale: 'px-2 py-1 text-xs font-bold uppercase bg-red-600 text-white',
    badgeOutOfStock: 'px-2 py-1 text-xs font-bold uppercase bg-neutral-600 text-white',

    // Button - Based on Cornerstone button styles
    buttonPrimary: 'inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 transition-colors',
    buttonSecondary: 'inline-flex items-center justify-center border border-neutral-300 bg-white text-neutral-700 font-medium px-6 py-3 hover:bg-neutral-50 transition-colors',

    // Grid - Based on Cornerstone _productGrid.scss
    gridWrapper: 'grid gap-0',
    gridColumns: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',

    // PDP - Traditional two-column
    pdpLayout: 'grid md:grid-cols-2 gap-6',
    pdpGallery: 'space-y-4',
    pdpInfo: 'space-y-4',

    // Variants - Cornerstone uses traditional selects/swatches
    variantWrapper: 'space-y-4',
    variantSwatch: 'w-8 h-8 border-2 border-neutral-300 hover:border-blue-600 transition-colors',
    variantSwatchSelected: 'border-blue-600 ring-2 ring-blue-600 ring-offset-1',
    variantDropdown: 'w-full border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-blue-600 focus:outline-none',

    // Rating - SVG star icons
    ratingWrapper: 'flex items-center gap-0.5 mt-1',
    ratingStar: 'w-4 h-4 text-yellow-500 fill-current',
    ratingStarEmpty: 'w-4 h-4 text-neutral-300 fill-current',

    colors: {
      bg: 'bg-blue-50',
      bgHover: 'hover:bg-blue-100',
      border: 'border-blue-200',
      borderHover: 'hover:border-blue-600',
      text: 'text-blue-600',
      accent: 'bg-blue-600',
      ring: 'ring-blue-600',
    },
  },

  /**
   * Makeswift
   * Source: makeswift.com, docs.makeswift.com
   *
   * Key patterns:
   * - Magenta accent color (#E536AB / pink-500)
   * - Modern, minimalist aesthetic
   * - Generous whitespace
   * - 12-16px border radius
   * - Tight letter-spacing (-0.01em)
   * - Clean, uncluttered layouts
   */
  makeswift: {
    name: 'Makeswift',
    description: 'Visual builder storefront',

    // Card - Modern, clean aesthetic
    cardWrapper: 'group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300',
    cardImageContainer: 'relative overflow-hidden bg-neutral-50 dark:bg-neutral-800',
    cardImageStyle: 'w-full object-cover transition-transform duration-500 group-hover:scale-105',
    cardBody: 'p-5 space-y-2',
    cardTitle: 'font-semibold text-neutral-900 dark:text-white tracking-tight leading-tight',
    cardSubtitle: 'text-sm text-neutral-500 dark:text-neutral-400 tracking-tight',

    imageAspect: 'aspect-square',
    imageHover: 'group-hover:scale-105',
    placeholderStyle: 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center',

    // Price - Clean with accent color for sales
    priceWrapper: 'flex items-center gap-3',
    priceRegular: 'text-lg font-semibold text-neutral-900 dark:text-white tracking-tight',
    priceSale: 'text-lg font-semibold text-pink-600 dark:text-pink-400 tracking-tight',
    priceOriginal: 'text-sm text-neutral-400 line-through',

    // Badge - Rounded, accent colored
    badgeWrapper: 'absolute top-4 left-4',
    badgeSale: 'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-pink-500 text-white',
    badgeOutOfStock: 'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-neutral-800 text-white',

    // Button - Gradient with pink accent
    buttonPrimary: 'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-8 py-3.5 transition-all shadow-md hover:shadow-lg',
    buttonSecondary: 'inline-flex items-center justify-center rounded-full border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold px-8 py-3.5 hover:border-pink-300 transition-all',

    // Grid - Generous spacing
    gridWrapper: 'grid gap-8',
    gridColumns: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',

    // PDP - Spacious layout
    pdpLayout: 'grid lg:grid-cols-2 gap-12',
    pdpGallery: 'space-y-6',
    pdpInfo: 'space-y-8',

    // Variants - Pill-shaped, clean
    variantWrapper: 'space-y-6',
    variantSwatch: 'w-10 h-10 rounded-full border-2 border-neutral-200 hover:border-pink-400 transition-all shadow-sm',
    variantSwatchSelected: 'border-pink-500 ring-2 ring-pink-500/30 ring-offset-2',
    variantDropdown: 'w-full rounded-xl border-2 border-neutral-200 bg-white px-5 py-3.5 text-neutral-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all',

    // Rating
    ratingWrapper: 'flex items-center gap-1',
    ratingStar: 'w-5 h-5 text-pink-500 fill-current',
    ratingStarEmpty: 'w-5 h-5 text-neutral-200 fill-current',

    colors: {
      bg: 'bg-pink-50',
      bgHover: 'hover:bg-pink-100',
      border: 'border-pink-200',
      borderHover: 'hover:border-pink-500',
      text: 'text-pink-600',
      accent: 'bg-pink-500',
      ring: 'ring-pink-500',
    },
  },
};

// Legacy alias for bc-bridge -> now shows raw data
export const PATH_NAMES: Record<PreviewPathId, string> = {
  catalyst: 'Catalyst',
  stencil: 'Stencil',
  makeswift: 'Makeswift',
};

export const PATH_DESCRIPTIONS: Record<PreviewPathId, string> = {
  catalyst: 'Headless React/Next.js storefront',
  stencil: 'Native BigCommerce theme (Cornerstone)',
  makeswift: 'Visual builder storefront',
};

export const PATH_ICONS: Record<PreviewPathId, string> = {
  catalyst: 'Rocket',      // Modern, headless
  stencil: 'Palette',      // Theme/design focused
  makeswift: 'Sparkles',   // Visual builder
};
