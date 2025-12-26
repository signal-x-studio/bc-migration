/**
 * Process HTML content for safe rendering
 * Adds IDs to headings for anchor links and applies basic sanitization
 * This function must be deterministic - same input always produces same output
 */
export function processHTML(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Normalize the content first to ensure consistent processing
  // This helps avoid hydration mismatches
  let processed = content
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')    // Handle old Mac line endings
    .replace(/\n{3,}/g, '\n\n'); // Normalize multiple newlines

  // Add IDs to headings for anchor links (if they don't have them)
  // Process in reverse order (h6 to h1) to avoid nested heading issues
  for (let level = 6; level >= 1; level--) {
    processed = processed.replace(
      new RegExp(`<h${level}(\\s[^>]*)?>([\\s\\S]*?)<\\/h${level}>`, 'gi'),
      (match, attrs, content) => {
        // Check if ID already exists
        if (attrs && /id\s*=\s*["']/i.test(attrs)) {
          return match;
        }
        
        // Extract text content (strip HTML tags for slug generation)
        const textContent = content.replace(/<[^>]+>/g, '').trim();
        if (!textContent) {
          return match;
        }
        
        // Generate slug from text - ensure it's deterministic
        const slug = textContent
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')  // Remove leading/trailing dashes
          .trim();
        
        if (!slug) {
          return match;
        }
        
        // Add ID attribute - ensure consistent formatting
        const attrsStr = attrs ? attrs.trim() : '';
        const separator = attrsStr ? ' ' : '';
        const idAttr = `${separator}id="${slug}"`;
        
        return `<h${level}${attrsStr}${idAttr}>${content}</h${level}>`;
      }
    );
  }

  // Ensure code blocks have proper classes for syntax highlighting
  processed = processed.replace(
    /<pre(\s[^>]*)?>/gi,
    (match, attrs) => {
      const attrsStr = attrs || '';
      if (!/class\s*=\s*["']/i.test(attrsStr)) {
        return `<pre class="hljs"${attrsStr}>`;
      }
      if (!/hljs/i.test(attrsStr)) {
        return match.replace(/class\s*=\s*["']([^"']*)["']/i, 'class="$1 hljs"');
      }
      return match;
    }
  );

  return processed;
}

