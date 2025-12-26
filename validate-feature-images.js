#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';
const PUBLIC_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/public';
const RESULTS_FILE = '/Users/nino/Workspace/dev/products/bc-migration/feature-images-validation-report.json';

// Function to extract featureImage from frontmatter
function extractFeatureImage(content, filename) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const featureImageMatch = frontmatter.match(/featureImage:\s*"([^"]+)"/);

  return featureImageMatch ? featureImageMatch[1] : null;
}

// Function to make HEAD request
function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FeatureImageValidator/1.0)'
      }
    };

    const req = protocol.request(url, options, (res) => {
      resolve({
        success: res.statusCode === 200,
        status: res.statusCode,
        error: null
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: null,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: null,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// Function to check local file
function checkLocalFile(imagePath) {
  // Local paths like /content/images/... should be in public/content/images/...
  const fullPath = path.join(PUBLIC_DIR, imagePath);

  if (fs.existsSync(fullPath)) {
    return { exists: true, path: fullPath };
  }

  return { exists: false, path: fullPath };
}

// Main validation function
async function validateFeatureImages() {
  console.log('Starting feature image validation...\n');

  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      totalImages: 0,
      unsplashValid: 0,
      unsplashBroken: 0,
      localValid: 0,
      localMissing: 0,
      noFeatureImage: 0
    },
    validImages: [],
    brokenImages: [],
    localMissing: [],
    noFeatureImage: []
  };

  // Get all MDX files
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
  results.summary.totalFiles = files.length;

  console.log(`Found ${files.length} MDX files\n`);

  // Process each file
  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const featureImage = extractFeatureImage(content, file);

    if (!featureImage) {
      results.summary.noFeatureImage++;
      results.noFeatureImage.push({
        file,
        reason: 'No featureImage found in frontmatter'
      });
      continue;
    }

    results.summary.totalImages++;

    // Check if it's an Unsplash URL
    if (featureImage.startsWith('http://') || featureImage.startsWith('https://')) {
      process.stdout.write(`Checking ${file}: ${featureImage.substring(0, 60)}... `);

      const result = await checkUrl(featureImage);

      if (result.success) {
        console.log('✓ OK');
        results.summary.unsplashValid++;
        results.validImages.push({
          file,
          url: featureImage,
          status: result.status,
          type: 'url'
        });
      } else {
        console.log(`✗ FAILED (${result.status || result.error})`);
        results.summary.unsplashBroken++;
        results.brokenImages.push({
          file,
          url: featureImage,
          status: result.status,
          error: result.error,
          type: 'url'
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Check if it's a local path
    else if (featureImage.startsWith('/content/')) {
      process.stdout.write(`Checking ${file}: ${featureImage}... `);

      const result = checkLocalFile(featureImage);

      if (result.exists) {
        console.log('✓ EXISTS');
        results.summary.localValid++;
        results.validImages.push({
          file,
          path: featureImage,
          fullPath: result.path,
          type: 'local'
        });
      } else {
        console.log('✗ MISSING');
        results.summary.localMissing++;
        results.localMissing.push({
          file,
          path: featureImage,
          expectedPath: result.path,
          type: 'local'
        });
      }
    } else {
      console.log(`Unknown image path format in ${file}: ${featureImage}`);
    }
  }

  // Save results to file
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total MDX files processed: ${results.summary.totalFiles}`);
  console.log(`Files with featureImage: ${results.summary.totalImages}`);
  console.log(`Files without featureImage: ${results.summary.noFeatureImage}`);
  console.log('');
  console.log('Unsplash URLs:');
  console.log(`  ✓ Valid (200): ${results.summary.unsplashValid}`);
  console.log(`  ✗ Broken: ${results.summary.unsplashBroken}`);
  console.log('');
  console.log('Local Images:');
  console.log(`  ✓ Exists: ${results.summary.localValid}`);
  console.log(`  ✗ Missing: ${results.summary.localMissing}`);
  console.log('');
  console.log('Total Valid Images: ' + (results.summary.unsplashValid + results.summary.localValid));
  console.log('Total Issues: ' + (results.summary.unsplashBroken + results.summary.localMissing + results.summary.noFeatureImage));
  console.log('='.repeat(70));

  if (results.brokenImages.length > 0) {
    console.log('\nBROKEN URLS:');
    results.brokenImages.forEach(item => {
      console.log(`  - ${item.file}`);
      console.log(`    URL: ${item.url}`);
      console.log(`    Error: ${item.status || item.error}`);
    });
  }

  if (results.localMissing.length > 0) {
    console.log('\nMISSING LOCAL FILES:');
    results.localMissing.forEach(item => {
      console.log(`  - ${item.file}`);
      console.log(`    Path: ${item.path}`);
      console.log(`    Expected at: ${item.expectedPath}`);
    });
  }

  if (results.noFeatureImage.length > 0) {
    console.log('\nFILES WITHOUT FEATURE IMAGE:');
    results.noFeatureImage.forEach(item => {
      console.log(`  - ${item.file}`);
    });
  }

  console.log(`\nDetailed results saved to: ${RESULTS_FILE}`);
}

// Run the validation
validateFeatureImages().catch(console.error);
