#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
const searchTerms = {};
const urlToFile = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
  const match = content.match(/featureImage:\s*"([^"]+)"/);
  if (!match) return;

  const url = match[1];

  // Extract search term from ixid parameter (it's base64 encoded)
  const ixidMatch = url.match(/ixid=([^&]+)/);
  if (ixidMatch) {
    try {
      // The search term is embedded in the ixid - look for pattern
      const ixid = ixidMatch[1];
      // Extract the part that contains the search (usually after c2VhcmNo which is "search" in base64)
      const searchMatch = ixid.match(/c2VhcmNo([A-Za-z0-9+/=]+)/);
      if (searchMatch) {
        const decoded = Buffer.from('search' + searchMatch[1], 'base64').toString('utf-8');
        // Extract readable search term
        const termMatch = decoded.match(/\|([^|]+)\|/);
        if (termMatch) {
          const term = decodeURIComponent(termMatch[1].replace(/\+/g, ' '));
          if (!searchTerms[term]) searchTerms[term] = [];
          searchTerms[term].push(file);
        }
      }
    } catch (e) {}
  }

  // Also track by photo ID
  const photoMatch = url.match(/photo-([a-zA-Z0-9_-]+)/);
  if (photoMatch) {
    const photoId = photoMatch[1];
    if (!urlToFile[photoId]) urlToFile[photoId] = [];
    urlToFile[photoId].push(file);
  }
});

console.log('=== POSTS USING SAME SEARCH TERMS (potential visual similarity) ===\n');
Object.entries(searchTerms)
  .filter(([term, files]) => files.length >= 2)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([term, files]) => {
    console.log(`\n🔍 "${term}" (${files.length} posts):`);
    files.forEach(f => console.log('  -', f));
  });

console.log('\n\n=== DUPLICATE PHOTO IDs ===\n');
Object.entries(urlToFile)
  .filter(([id, files]) => files.length >= 2)
  .forEach(([id, files]) => {
    console.log(`Photo: ${id}`);
    files.forEach(f => console.log('  -', f));
  });

if (Object.entries(urlToFile).filter(([id, files]) => files.length >= 2).length === 0) {
  console.log('No duplicate photo IDs found.');
}
