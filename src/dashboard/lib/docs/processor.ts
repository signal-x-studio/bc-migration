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

  // Enhance code blocks: add wrapper, language detection, and prepare for copy button
  // Also detect D2 diagrams and mark them for rendering
  processed = processed.replace(
    /<pre(\s[^>]*)?>([\s\S]*?)<\/pre>/gi,
    (match, attrs, codeContent) => {
      const attrsStr = attrs || '';
      
      // Extract language from class attribute (e.g., class="language-javascript")
      let language = '';
      const langMatch = attrsStr.match(/class\s*=\s*["']([^"']*)["']/i);
      if (langMatch) {
        const classes = langMatch[1];
        const langClassMatch = classes.match(/language-(\w+)/i);
        if (langClassMatch) {
          language = langClassMatch[1];
        }
      }
      
      // Also check for lang attribute
      if (!language) {
        const langAttrMatch = attrsStr.match(/lang\s*=\s*["']([^"']+)["']/i);
        if (langAttrMatch) {
          language = langAttrMatch[1];
        }
      }
      
      // Clean code content for copy (remove HTML entities, preserve structure)
      const cleanCode = codeContent
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // Extract text from code (remove code tags if nested)
      const codeText = cleanCode.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '$1');
      
      // Check if this is a D2 diagram
      // D2 diagrams typically start with "direction:" or "title:" or contain D2-specific syntax
      const trimmedCode = codeText.trim();
      const isD2 = language === 'd2' || 
                   language === 'd2lang' ||
                   trimmedCode.startsWith('direction:') ||
                   trimmedCode.startsWith('title:') ||
                   (trimmedCode.includes('shape:') && trimmedCode.includes('style.fill:'));
      
      if (isD2) {
        // Mark as D2 diagram for client-side rendering
        // Use base64 encoding to safely store the code in HTML attribute
        // Convert to base64 using btoa (available in Node.js environment)
        let base64Code: string;
        if (typeof Buffer !== 'undefined') {
          // Node.js environment
          base64Code = Buffer.from(codeText, 'utf8').toString('base64');
        } else {
          // Browser environment (shouldn't happen in processor, but just in case)
          base64Code = btoa(unescape(encodeURIComponent(codeText)));
        }
        return `<div class="docs-d2-diagram-wrapper" data-d2-code-base64="${base64Code}"></div>`;
      }
      
      // Add data attributes for client-side processing
      const dataAttrs = ` data-code="${codeText.replace(/"/g, '&quot;')}"${language ? ` data-language="${language}"` : ''}`;
      
      // Ensure hljs class for syntax highlighting
      let finalAttrs = attrsStr;
      if (!/class\s*=\s*["']/i.test(finalAttrs)) {
        finalAttrs = ` class="hljs"${finalAttrs}`;
      } else if (!/hljs/i.test(finalAttrs)) {
        finalAttrs = finalAttrs.replace(/class\s*=\s*["']([^"']*)["']/i, 'class="$1 hljs"');
      }
      
      // Wrap in container for copy button
      return `<div class="docs-code-block-wrapper"${dataAttrs}><pre${finalAttrs}>${codeContent}</pre></div>`;
    }
  );

  // Final normalization: ensure consistent whitespace handling
  // This prevents hydration mismatches from whitespace differences between server and client
  
  // Remove leading/trailing whitespace from the entire content
  processed = processed.trim();
  
  // Split content into segments to preserve code blocks
  const codeBlockRegex = /<pre[^>]*>[\s\S]*?<\/pre>/gi;
  const codeBlocks: string[] = [];
  let codeBlockIndex = 0;
  
  // Replace code blocks with placeholders
  processed = processed.replace(codeBlockRegex, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    codeBlocks[codeBlockIndex] = match;
    codeBlockIndex++;
    return placeholder;
  });
  
  // Remove whitespace-only text nodes between HTML tags
  // This removes newlines, spaces, and tabs between tags
  processed = processed.replace(/(>)\s+(<)/g, '$1$2');
  
  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    processed = processed.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return processed;
}

