import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * Convert Markdown file to HTML with frontmatter metadata
 */
function convertMarkdownToHTML(mdPath: string, htmlPath: string): void {
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const { data, content } = matter(mdContent);
  
  // Convert markdown to HTML
  const htmlBody = marked(content, {
    gfm: true,
    breaks: false,
  });
  
  // Extract title from frontmatter or first heading
  const title = data.title || extractTitleFromMarkdown(content);
  const description = data.description || '';
  const category = data.category || '';
  const order = data.order || 999;
  
  // Generate HTML with frontmatter comment
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <!-- frontmatter
title: "${escapeHtml(title)}"
description: "${escapeHtml(description)}"
category: "${escapeHtml(category)}"
order: ${order}
-->
</head>
<body>
${htmlBody}
</body>
</html>`;
  
  // Ensure directory exists
  const htmlDir = path.dirname(htmlPath);
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }
  
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`Converted: ${mdPath} -> ${htmlPath}`);
}

function extractTitleFromMarkdown(content: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  return 'Untitled';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Recursively find and convert all .md files to .html
 */
function convertAllMarkdownFiles(dir: string): void {
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Skip hidden files and config files
    if (entry.name.startsWith('.') || entry.name === '_config.json') {
      continue;
    }
    
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      convertAllMarkdownFiles(fullPath);
    } else if (entry.name.endsWith('.md')) {
      const htmlPath = fullPath.replace(/\.md$/, '.html');
      convertMarkdownToHTML(fullPath, htmlPath);
    }
  }
}

// Run conversion
console.log('Converting all Markdown files to HTML...');
console.log(`Source directory: ${DOCS_DIR}`);
convertAllMarkdownFiles(DOCS_DIR);
console.log('Conversion complete!');

