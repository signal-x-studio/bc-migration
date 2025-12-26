#!/usr/bin/env node
/**
 * Blog Feature Image Audit with Computer Vision
 * Uses Google Gemini Vision API to analyze images and validate relevance
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyBV4eXRDZHqHjgMjScKC0h5oTyjKPZnKIU';
const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Extract frontmatter from MDX file
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let value = keyMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      frontmatter[currentKey] = value;
    }
  }

  return frontmatter;
}

// Fetch image as base64
async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (e) {
    return null;
  }
}

// Analyze image with Gemini Vision
async function analyzeImage(imageUrl, postTitle, postExcerpt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const imageBase64 = await fetchImageAsBase64(imageUrl);
  if (!imageBase64) {
    return { error: 'Failed to fetch image' };
  }

  const prompt = `Analyze this image and provide:
1. A detailed description of what's in the image (2-3 sentences)
2. The main visual elements/objects
3. The mood/tone of the image
4. Is this a generic stock photo or unique/specific?

This image is being used as a feature image for a blog post titled: "${postTitle}"
Post excerpt: "${postExcerpt || 'N/A'}"

5. Rate the relevance of this image to the blog post content (1-10, where 10 is perfect match)
6. Explain why you gave that relevance score

Format your response as JSON:
{
  "description": "...",
  "mainElements": ["element1", "element2"],
  "mood": "...",
  "isGenericStock": true/false,
  "relevanceScore": N,
  "relevanceExplanation": "..."
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      }
    ]);

    const text = result.response.text();
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { rawResponse: text };
  } catch (e) {
    return { error: e.message };
  }
}

// Main audit function
async function auditImages() {
  console.log('Starting Blog Image Audit with Computer Vision...\n');

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
  const results = [];
  const imageDescriptions = new Map(); // For finding duplicates

  console.log(`Found ${files.length} blog posts to analyze\n`);

  let processed = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter || !frontmatter.featureImage) {
      continue;
    }

    processed++;
    console.log(`[${processed}/${files.length}] Analyzing: ${frontmatter.title || file}`);

    const analysis = await analyzeImage(
      frontmatter.featureImage,
      frontmatter.title || file,
      frontmatter.excerpt || frontmatter.metaDescription || ''
    );

    const result = {
      file,
      title: frontmatter.title,
      imageUrl: frontmatter.featureImage,
      analysis
    };

    results.push(result);

    // Track image descriptions for duplicate detection
    if (analysis.description) {
      const key = analysis.description.toLowerCase().substring(0, 100);
      if (!imageDescriptions.has(key)) {
        imageDescriptions.set(key, []);
      }
      imageDescriptions.get(key).push(file);
    }

    // Rate limit - Gemini 2.0 has higher limits
    await new Promise(r => setTimeout(r, 1500));

    // Save intermediate results every 10 posts
    if (processed % 10 === 0) {
      fs.writeFileSync(
        '/Users/nino/Workspace/dev/products/bc-migration/image-audit-results-partial.json',
        JSON.stringify(results, null, 2)
      );
      console.log(`  Saved intermediate results (${processed} posts)`);
    }
  }

  // Find issues
  const issues = {
    lowRelevance: results.filter(r => r.analysis?.relevanceScore && r.analysis.relevanceScore < 5),
    genericStock: results.filter(r => r.analysis?.isGenericStock === true),
    potentialDuplicates: [],
    errors: results.filter(r => r.analysis?.error)
  };

  // Find duplicates by comparing descriptions
  for (const [desc, files] of imageDescriptions) {
    if (files.length > 1) {
      issues.potentialDuplicates.push({ description: desc, files });
    }
  }

  // Generate report
  const report = {
    summary: {
      totalPosts: files.length,
      analyzed: results.length,
      lowRelevanceCount: issues.lowRelevance.length,
      genericStockCount: issues.genericStock.length,
      duplicateGroups: issues.potentialDuplicates.length,
      errors: issues.errors.length
    },
    issues,
    allResults: results
  };

  // Save full report
  fs.writeFileSync(
    '/Users/nino/Workspace/dev/products/bc-migration/image-audit-vision-report.json',
    JSON.stringify(report, null, 2)
  );

  // Generate readable summary
  let summary = `# Blog Feature Image Audit Report\n\n`;
  summary += `## Summary\n`;
  summary += `- Total posts: ${report.summary.totalPosts}\n`;
  summary += `- Analyzed: ${report.summary.analyzed}\n`;
  summary += `- Low relevance images: ${report.summary.lowRelevanceCount}\n`;
  summary += `- Generic stock photos: ${report.summary.genericStockCount}\n`;
  summary += `- Potential duplicate groups: ${report.summary.duplicateGroups}\n`;
  summary += `- Errors: ${report.summary.errors}\n\n`;

  if (issues.lowRelevance.length > 0) {
    summary += `## Low Relevance Images (Score < 5)\n\n`;
    for (const item of issues.lowRelevance) {
      summary += `### ${item.title}\n`;
      summary += `- File: ${item.file}\n`;
      summary += `- Score: ${item.analysis.relevanceScore}/10\n`;
      summary += `- Description: ${item.analysis.description}\n`;
      summary += `- Reason: ${item.analysis.relevanceExplanation}\n\n`;
    }
  }

  if (issues.potentialDuplicates.length > 0) {
    summary += `## Potential Duplicate Images\n\n`;
    for (const dup of issues.potentialDuplicates) {
      summary += `### Similar images found:\n`;
      summary += `- Description: ${dup.description}...\n`;
      summary += `- Files: ${dup.files.join(', ')}\n\n`;
    }
  }

  fs.writeFileSync(
    '/Users/nino/Workspace/dev/products/bc-migration/image-audit-vision-report.md',
    summary
  );

  console.log('\n✅ Audit complete!');
  console.log(`Report saved to image-audit-vision-report.json and image-audit-vision-report.md`);

  return report;
}

auditImages().catch(console.error);
