'use client';

import { useMemo } from 'react';
import { WPContentTheme, getWPContentTheme } from '@/lib/wp-content-themes';

interface WPContentRendererProps {
  content: string;
  theme?: WPContentTheme;
  className?: string;
}

/**
 * Renders WordPress HTML content with theme-specific styling
 * Sanitizes and transforms the content for safe display
 */
export function WPContentRenderer({
  content,
  theme = 'catalyst',
  className = '',
}: WPContentRendererProps) {
  const themeConfig = getWPContentTheme(theme);

  // Process and style the HTML content
  const processedContent = useMemo(() => {
    if (!content) return '';

    let html = content;

    // Replace heading tags with styled versions
    html = html.replace(/<h1([^>]*)>/gi, `<h1 class="${themeConfig.heading1}"$1>`);
    html = html.replace(/<h2([^>]*)>/gi, `<h2 class="${themeConfig.heading2}"$1>`);
    html = html.replace(/<h3([^>]*)>/gi, `<h3 class="${themeConfig.heading3}"$1>`);
    html = html.replace(/<h4([^>]*)>/gi, `<h4 class="${themeConfig.heading4}"$1>`);

    // Style paragraphs
    html = html.replace(/<p([^>]*)>/gi, `<p class="${themeConfig.paragraph}"$1>`);

    // Style links
    html = html.replace(/<a([^>]*)>/gi, (match, attrs) => {
      // Preserve existing classes and add theme classes
      if (attrs.includes('class="')) {
        return match.replace(/class="([^"]*)"/, `class="$1 ${themeConfig.link}"`);
      }
      return `<a class="${themeConfig.link}"${attrs}>`;
    });

    // Style blockquotes
    html = html.replace(/<blockquote([^>]*)>/gi, `<blockquote class="${themeConfig.blockquote}"$1>`);

    // Style code blocks
    html = html.replace(/<pre([^>]*)>/gi, `<pre class="${themeConfig.codeBlock}"$1>`);
    html = html.replace(/<code([^>]*)>/gi, (match, attrs) => {
      // Only style inline code (code not inside pre)
      return `<code class="${themeConfig.inlineCode}"${attrs}>`;
    });

    // Style lists
    html = html.replace(/<ul([^>]*)>/gi, `<ul class="${themeConfig.list}"$1>`);
    html = html.replace(/<ol([^>]*)>/gi, `<ol class="${themeConfig.list.replace('list-disc', 'list-decimal')}"$1>`);
    html = html.replace(/<li([^>]*)>/gi, `<li class="${themeConfig.listItem}"$1>`);

    // Style images
    html = html.replace(/<img([^>]*)>/gi, `<img class="${themeConfig.image}"$1>`);

    // Style figures and captions
    html = html.replace(/<figure([^>]*)>/gi, `<figure class="${themeConfig.figure}"$1>`);
    html = html.replace(/<figcaption([^>]*)>/gi, `<figcaption class="${themeConfig.figcaption}"$1>`);

    // Style WordPress blocks
    // Buttons
    html = html.replace(
      /class="wp-block-button__link([^"]*)"/gi,
      `class="wp-block-button__link$1 ${themeConfig.wpButton}"`
    );

    // Columns
    html = html.replace(
      /class="wp-block-columns([^"]*)"/gi,
      `class="wp-block-columns$1 ${themeConfig.wpColumns}"`
    );
    html = html.replace(
      /class="wp-block-column([^"]*)"/gi,
      `class="wp-block-column$1 ${themeConfig.wpColumn}"`
    );

    // Separator
    html = html.replace(
      /class="wp-block-separator([^"]*)"/gi,
      `class="wp-block-separator$1 ${themeConfig.wpSeparator}"`
    );
    html = html.replace(/<hr([^>]*)>/gi, `<hr class="${themeConfig.wpSeparator}"$1>`);

    // Quote
    html = html.replace(
      /class="wp-block-quote([^"]*)"/gi,
      `class="wp-block-quote$1 ${themeConfig.wpQuote}"`
    );

    // Pullquote
    html = html.replace(
      /class="wp-block-pullquote([^"]*)"/gi,
      `class="wp-block-pullquote$1 ${themeConfig.wpPullquote}"`
    );

    // Handle columns grid - determine number of columns
    html = html.replace(
      /class="wp-block-columns([^"]*)"([^>]*)>/gi,
      (match, classes, rest) => {
        // Count column children to set grid columns
        const columnCount = (html.match(/wp-block-column/g) || []).length;
        const gridCols = columnCount <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
        return `class="wp-block-columns${classes} ${themeConfig.wpColumns} ${gridCols}"${rest}>`;
      }
    );

    return html;
  }, [content, themeConfig]);

  return (
    <div
      className={`${themeConfig.container} ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
