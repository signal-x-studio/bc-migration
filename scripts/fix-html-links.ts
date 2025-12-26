import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * Fix all .md links to .html in HTML files
 */
function fixLinksInFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Replace .md links with .html (but not in code blocks)
  const linkPattern = /href=["']([^"']+\.md)([#"'])/gi;
  const matches = content.matchAll(linkPattern);
  
  for (const match of matches) {
    const fullMatch = match[0];
    const linkPath = match[1];
    const suffix = match[2];
    const newLink = fullMatch.replace('.md', '.html');
    
    // Only replace if it's not in a code block
    const beforeMatch = content.substring(0, match.index);
    const codeBlockCount = (beforeMatch.match(/```/g) || []).length;
    const isInCodeBlock = codeBlockCount % 2 === 1;
    
    if (!isInCodeBlock) {
      content = content.replace(fullMatch, newLink);
      modified = true;
    }
  }
  
  // Also fix relative paths that might be broken
  // Fix strategy-kit specific broken links
  if (filePath.includes('strategy-kit/INDEX.html')) {
    // These files don't exist, so we'll comment them out or remove
    content = content.replace(
      /href=["']strategy\/[^"']+\.md["']/gi,
      (match) => {
        // Comment out broken links
        return match.replace('href=', 'data-broken-link=');
      }
    );
    content = content.replace(
      /href=["']collateral\/[^"']+\.md["']/gi,
      (match) => {
        return match.replace('href=', 'data-broken-link=');
      }
    );
    content = content.replace(
      /href=["']architecture\/[^"']+\.html["']/gi,
      (match) => {
        // Fix architecture links to point to platform/architecture
        return match.replace('architecture/', '../../platform/architecture/');
      }
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed links in: ${path.relative(DOCS_DIR, filePath)}`);
  }
}

/**
 * Recursively fix links in all HTML files
 */
function fixAllLinks(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '_config.json') {
      continue;
    }
    
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      fixAllLinks(fullPath);
    } else if (entry.name.endsWith('.html')) {
      fixLinksInFile(fullPath);
    }
  }
}

console.log('Fixing all .md links to .html in documentation...\n');
fixAllLinks(DOCS_DIR);
console.log('\n✓ Link fixing complete!');

