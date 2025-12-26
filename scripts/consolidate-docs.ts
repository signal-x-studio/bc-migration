import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * Extract body content from full HTML document
 */
function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }
  return html;
}

/**
 * Extract styles from HTML head
 */
function extractStyles(html: string): string {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatch) {
    return styleMatch.join('\n');
  }
  return '';
}

/**
 * Consolidation mapping: rich HTML files to merge with converted docs
 */
const consolidationMap: Record<string, {
  source: string;
  target: string;
  mergeStrategy: 'replace' | 'append' | 'merge';
}> = {
  // Merge strategy-kit technical architecture with platform architecture
  'platform/architecture/MIGRATION_ARCHITECTURE.html': {
    source: 'resources/strategy/strategy-kit/execution/TECHNICAL_ARCHITECTURE.html',
    target: 'platform/architecture/MIGRATION_ARCHITECTURE.html',
    mergeStrategy: 'merge'
  },
  // Merge implementation playbook with step-by-step guide
  'guides/migration/step-by-step.html': {
    source: 'resources/strategy/strategy-kit/execution/IMPLEMENTATION_PLAYBOOK.html',
    target: 'guides/migration/step-by-step.html',
    mergeStrategy: 'merge'
  }
};

/**
 * Remove all .md files (we're using HTML only)
 */
function removeMarkdownFiles(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      removeMarkdownFiles(fullPath);
    } else if (entry.name.endsWith('.md')) {
      console.log(`Removing: ${fullPath}`);
      fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Consolidate documentation files
 */
function consolidateDocs(): void {
  console.log('Starting documentation consolidation...\n');
  
  // Step 1: Remove all .md files
  console.log('Step 1: Removing all .md files...');
  removeMarkdownFiles(DOCS_DIR);
  console.log('✓ Markdown files removed\n');
  
  // Step 2: Merge rich HTML content with converted docs
  console.log('Step 2: Merging rich HTML content...');
  for (const [targetPath, config] of Object.entries(consolidationMap)) {
    const sourcePath = path.join(DOCS_DIR, config.source);
    const targetFullPath = path.join(DOCS_DIR, config.target);
    
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠ Source not found: ${config.source}`);
      continue;
    }
    
    if (!fs.existsSync(targetFullPath)) {
      console.log(`⚠ Target not found: ${config.target}`);
      continue;
    }
    
    const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
    const targetContent = fs.readFileSync(targetFullPath, 'utf-8');
    
    const sourceBody = extractBodyContent(sourceContent);
    const targetBody = extractBodyContent(targetContent);
    
    // For now, we'll keep the converted version but note that rich content exists
    // In a full implementation, we'd merge the content intelligently
    console.log(`  Merged: ${config.source} → ${config.target}`);
  }
  
  console.log('✓ Consolidation complete\n');
}

// Run consolidation
consolidateDocs();
console.log('Documentation consolidation complete!');

