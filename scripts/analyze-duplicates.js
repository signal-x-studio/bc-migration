#!/usr/bin/env node
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./image-audit-vision-report.json', 'utf-8'));
const analyzed = data.allResults.filter(d => d.analysis && d.analysis.description);

console.log('=== FINDING VISUALLY SIMILAR IMAGES ===\n');
console.log('Total analyzed:', analyzed.length);

// Group by main visual elements (first 2)
const elementGroups = {};
analyzed.forEach(d => {
  if (!d.analysis.mainElements) return;
  const key = d.analysis.mainElements.slice(0,2).sort().join('|').toLowerCase();
  if (!elementGroups[key]) elementGroups[key] = [];
  elementGroups[key].push({title: d.title, file: d.file, desc: d.analysis.description.substring(0,80)});
});

console.log('\nGroups with 2+ posts sharing similar main elements:\n');
Object.entries(elementGroups)
  .filter(([k,v]) => v.length >= 2)
  .sort((a,b) => b[1].length - a[1].length)
  .forEach(([key, posts]) => {
    console.log('\n📷 Elements:', key);
    posts.forEach(p => console.log('  -', p.title, '\n    ', p.desc));
  });

// Also search for specific keywords
console.log('\n\n=== SEARCHING FOR SPECIFIC IMAGE TYPES ===\n');

const searches = ['circuit', 'chess', 'robot', 'keyboard', 'laptop', 'woman', 'man in', 'office'];
searches.forEach(term => {
  const matches = analyzed.filter(d => {
    const text = (d.analysis.description + ' ' + (d.analysis.mainElements || []).join(' ')).toLowerCase();
    return text.includes(term);
  });
  if (matches.length > 1) {
    console.log(`\n🔍 "${term}" (${matches.length} posts):`);
    matches.forEach(m => console.log('  -', m.title));
  }
});

// Low relevance
console.log('\n\n=== LOW RELEVANCE IMAGES (< 6) ===\n');
analyzed.filter(d => d.analysis.relevanceScore < 6)
  .sort((a,b) => a.analysis.relevanceScore - b.analysis.relevanceScore)
  .forEach(d => {
    console.log(`${d.analysis.relevanceScore}/10 - ${d.title}`);
    console.log(`  File: ${d.file}`);
    console.log(`  Desc: ${d.analysis.description.substring(0,100)}`);
    console.log(`  Reason: ${d.analysis.relevanceExplanation.substring(0,100)}...\n`);
  });
