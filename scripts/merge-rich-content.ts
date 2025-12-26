import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * Extract body content from HTML, removing style tags and scripts
 */
function extractBodyContent(html: string): string {
  // Remove style tags and their content
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove script tags and their content
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    let body = bodyMatch[1].trim();
    
    // Remove navigation/sidebar elements (they're for standalone viewing)
    body = body.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    body = body.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
    body = body.replace(/<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
    body = body.replace(/<div[^>]*class="[^"]*layout[^"]*"[^>]*>/gi, '');
    body = body.replace(/<\/div>\s*<\/div>\s*<\/body>/i, '</body>');
    
    // Clean up main content wrapper
    body = body.replace(/<main[^>]*class="[^"]*main-content[^"]*"[^>]*>/gi, '');
    body = body.replace(/<\/main>/gi, '');
    
    // Remove header elements that are navigation
    body = body.replace(/<header[^>]*class="[^"]*doc-header[^"]*"[^>]*>[\s\S]*?<\/header>/gi, '');
    
    return body;
  }
  
  return html;
}

/**
 * Extract key sections from rich HTML for merging
 */
function extractKeySections(html: string): {
  overview?: string;
  apis?: string;
  dataFlows?: string;
  infrastructure?: string;
  phases?: string;
} {
  const body = extractBodyContent(html);
  const sections: any = {};
  
  // Extract sections by ID or heading
  const sectionPatterns = [
    { key: 'overview', pattern: /<section[^>]*id="overview"[^>]*>([\s\S]*?)<\/section>/i },
    { key: 'apis', pattern: /<section[^>]*id="apis"[^>]*>([\s\S]*?)<\/section>/i },
    { key: 'dataFlows', pattern: /<section[^>]*id="data-flows"[^>]*>([\s\S]*?)<\/section>/i },
    { key: 'infrastructure', pattern: /<section[^>]*id="infrastructure"[^>]*>([\s\S]*?)<\/section>/i },
    { key: 'phases', pattern: /<section[^>]*id="phase[^"]*"[^>]*>([\s\S]*?)<\/section>/gi },
  ];
  
  for (const { key, pattern } of sectionPatterns) {
    const matches = body.matchAll(pattern);
    const content: string[] = [];
    for (const match of matches) {
      content.push(match[1].trim());
    }
    if (content.length > 0) {
      sections[key] = content.join('\n\n');
    }
  }
  
  return sections;
}

/**
 * Merge rich content into target file
 */
function mergeContent(sourcePath: string, targetPath: string, strategy: 'append' | 'prepend' | 'replace' = 'append'): void {
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠ Source not found: ${sourcePath}`);
    return;
  }
  
  if (!fs.existsSync(targetPath)) {
    console.log(`⚠ Target not found: ${targetPath}`);
    return;
  }
  
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const targetContent = fs.readFileSync(targetPath, 'utf-8');
  
  const sourceBody = extractBodyContent(sourceContent);
  
  // Extract target body
  const targetBodyMatch = targetContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!targetBodyMatch) {
    console.log(`⚠ Could not extract body from target: ${targetPath}`);
    return;
  }
  
  let newBody = targetBodyMatch[1];
  
  if (strategy === 'append') {
    // Append source content after existing content
    newBody = newBody + '\n\n<hr>\n\n' + sourceBody;
  } else if (strategy === 'prepend') {
    // Prepend source content before existing content
    newBody = sourceBody + '\n\n<hr>\n\n' + newBody;
  } else {
    // Replace (for now, we'll append with a note)
    newBody = newBody + '\n\n<hr>\n\n<h2>Additional Technical Details</h2>\n\n' + sourceBody;
  }
  
  // Reconstruct HTML
  const newContent = targetContent.replace(
    /<body[^>]*>[\s\S]*<\/body>/i,
    `<body>\n${newBody}\n</body>`
  );
  
  fs.writeFileSync(targetPath, newContent, 'utf-8');
  console.log(`✓ Merged: ${path.relative(DOCS_DIR, sourcePath)} → ${path.relative(DOCS_DIR, targetPath)}`);
}

console.log('Merging rich HTML content into user-facing documentation...\n');

// Merge technical architecture
mergeContent(
  path.join(DOCS_DIR, 'resources/strategy/strategy-kit/execution/TECHNICAL_ARCHITECTURE.html'),
  path.join(DOCS_DIR, 'platform/architecture/MIGRATION_ARCHITECTURE.html'),
  'append'
);

// Merge implementation playbook
mergeContent(
  path.join(DOCS_DIR, 'resources/strategy/strategy-kit/execution/IMPLEMENTATION_PLAYBOOK.html'),
  path.join(DOCS_DIR, 'guides/migration/step-by-step.html'),
  'append'
);

console.log('\n✓ Content merging complete!');

