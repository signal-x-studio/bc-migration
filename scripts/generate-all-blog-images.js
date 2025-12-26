#!/usr/bin/env node
/**
 * Generate custom blog feature images for ALL posts using Gemini 2.0 Flash
 * Uses Signal Dispatch Visual Style System for consistency
 *
 * Output: Optimized WebP images at 1200x675 (16:9), targeting 50-100KB
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const GOOGLE_API_KEY = 'AIzaSyBV4eXRDZHqHjgMjScKC0h5oTyjKPZnKIU';
const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';
const OUTPUT_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/public/images/generated';
const PROGRESS_FILE = './image-generation-progress.json';

// Target dimensions for blog feature images (16:9 aspect ratio)
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 675;
const WEBP_QUALITY = 82; // Balance between quality and file size

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Category-specific style configurations
const CATEGORY_STYLES = {
  'AI & Automation': {
    palette: 'Deep midnight blue base (#16213e) with electric blue and teal accents (#00d4ff, #1e6f6f)',
    motifs: 'flowing data streams, neural patterns, light passing through geometric structures, abstract tessellations',
    mood: 'Future-focused, clear-eyed, slightly mysterious'
  },
  'Reflections': {
    palette: 'Warm charcoal base with amber and gold accents (#c9a227)',
    motifs: 'natural formations, single contemplative objects, interplay of light and shadow, organic textures',
    mood: 'Introspective, honest, quietly vulnerable'
  },
  'Leadership': {
    palette: 'Deep charcoal (#1a1a2e) with muted gold accents',
    motifs: 'architectural silhouettes, bridges, pathways, elevation and perspective, structural forms',
    mood: 'Measured authority, earned wisdom, strategic clarity'
  },
  'Commerce': {
    palette: 'Dark slate (#0f0f23) with teal and green accents (#1e6f6f, #7cb342)',
    motifs: 'abstract flow patterns, structural frameworks, balance and tension, market-like movement',
    mood: 'Strategic clarity, calculated movement'
  },
  'Meta': {
    palette: 'Deep purple undertones (#6b5b95) with muted highlights',
    motifs: 'nested patterns, interconnected structures, layered abstractions, recursive forms',
    mood: 'Philosophical depth, pattern recognition'
  },
  'Insights': {
    palette: 'Charcoal base with dusty blue accents (#4a6fa5)',
    motifs: 'bridges connecting spaces, crossroads, architectural perspective, vast spaces with single figures',
    mood: 'Contemplative clarity, structural thinking'
  },
  'default': {
    palette: 'Deep charcoal (#1a1a2e) with muted teal and gold accents',
    motifs: 'abstract geometric forms, light through structure, minimalist compositions',
    mood: 'Contemplative, clear-eyed, intellectually serious'
  }
};

// Extract frontmatter from MDX file
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    if (line.match(/^\s+-\s/)) continue;
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      let value = keyMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      frontmatter[keyMatch[1]] = value;
    }
  }

  return frontmatter;
}

// Get category style or default
function getCategoryStyle(category) {
  if (!category) return CATEGORY_STYLES.default;

  // Check for partial matches
  for (const [key, style] of Object.entries(CATEGORY_STYLES)) {
    if (category.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(category.toLowerCase())) {
      return style;
    }
  }
  return CATEGORY_STYLES.default;
}

// Generate image prompt using style system with explicit dimensions
function createImagePrompt(title, excerpt, category) {
  const style = getCategoryStyle(category);

  return `Create a sophisticated, editorial-style blog feature image for Signal Dispatch.

BLOG POST:
Title: "${title}"
${excerpt ? `Summary: "${excerpt.substring(0, 250)}"` : ''}

VISUAL STYLE SYSTEM (MUST FOLLOW):
- Color Palette: ${style.palette}
- Visual Motifs: ${style.motifs}
- Mood: ${style.mood}

TECHNICAL REQUIREMENTS:
- Dimensions: 1200x675 pixels (16:9 aspect ratio)
- Composition optimized for web blog header display
- High contrast and clarity for smaller display sizes

CORE REQUIREMENTS:
- Dark, moody aesthetic with deep backgrounds
- Minimalist composition with 30-40% negative space
- Abstract or conceptual representation - NOT literal interpretation
- Single clear focal point with asymmetric composition
- Professional, architectural feel
- Contemplative mood - serious but not heavy

STRICT RULES:
- NO text, words, letters, numbers, or typography
- NO faces or identifiable people (abstract silhouettes OK)
- NO generic stock photo clichés (keyboards, coffee, sticky notes)
- NO bright/saturated colors - use muted, sophisticated tones
- NO cluttered compositions

OUTPUT: Create a 1200x675 pixel image (16:9 aspect ratio) suitable for professional blog header.

Create an evocative image that honors the complexity of the ideas without explaining them literally.`;
}

// Process and optimize image to WebP
async function optimizeImage(inputBuffer, outputPath) {
  try {
    const result = await sharp(inputBuffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: WEBP_QUALITY,
        effort: 6, // Higher effort = better compression
      })
      .toFile(outputPath);

    return result;
  } catch (e) {
    throw new Error(`Image optimization failed: ${e.message}`);
  }
}

// Generate image using Gemini and convert to optimized WebP
async function generateImage(prompt, filename) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['image', 'text'],
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const imageBuffer = Buffer.from(imageData, 'base64');

        // Convert to optimized WebP
        const outputPath = path.join(OUTPUT_DIR, `${filename}.webp`);
        const optimizeResult = await optimizeImage(imageBuffer, outputPath);

        const fileSizeKB = Math.round(optimizeResult.size / 1024);

        return {
          path: `/images/generated/${filename}.webp`,
          fullPath: outputPath,
          size: fileSizeKB
        };
      }
    }

    return null;
  } catch (e) {
    throw e;
  }
}

// Update MDX file with new image
function updateMdxFile(filepath, newImagePath) {
  let content = fs.readFileSync(filepath, 'utf-8');

  // Replace featureImage (various formats)
  content = content.replace(
    /featureImage:\s*["'][^"']*["']/,
    `featureImage: "${newImagePath}"`
  );

  // Replace ogImage in SEO section
  content = content.replace(
    /ogImage:\s*["'][^"']*["']/g,
    `ogImage: "${newImagePath}"`
  );

  fs.writeFileSync(filepath, content);
}

// Load/save progress
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { completed: [], failed: [], skipped: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Main function
async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const progress = loadProgress();
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  // Filter out already completed
  const remaining = files.filter(f =>
    !progress.completed.includes(f) &&
    !progress.skipped.includes(f)
  );

  console.log('🎨 Signal Dispatch Image Generator v2.0');
  console.log('   Gemini 2.0 Flash + Sharp WebP Optimization\n');
  console.log(`📐 Output: ${TARGET_WIDTH}x${TARGET_HEIGHT} WebP @ quality ${WEBP_QUALITY}`);
  console.log(`📊 Status:`);
  console.log(`   Total posts: ${files.length}`);
  console.log(`   Completed: ${progress.completed.length}`);
  console.log(`   Failed: ${progress.failed.length}`);
  console.log(`   Remaining: ${remaining.length}\n`);
  console.log('='.repeat(60) + '\n');

  let count = 0;
  let totalSize = 0;

  for (const filename of remaining) {
    count++;
    const filepath = path.join(BLOG_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter || !frontmatter.title) {
      console.log(`[${count}/${remaining.length}] ⚠️  Skipping: ${filename} (no frontmatter)`);
      progress.skipped.push(filename);
      saveProgress(progress);
      continue;
    }

    const shortTitle = frontmatter.title.length > 50
      ? frontmatter.title.substring(0, 47) + '...'
      : frontmatter.title;

    console.log(`[${count}/${remaining.length}] 🖼️  ${shortTitle}`);
    console.log(`              Category: ${frontmatter.category || 'default'}`);

    try {
      const prompt = createImagePrompt(
        frontmatter.title,
        frontmatter.excerpt || frontmatter.metaDescription || '',
        frontmatter.category
      );

      const slug = filename.replace('.mdx', '');
      const result = await generateImage(prompt, slug);

      if (result) {
        updateMdxFile(filepath, result.path);
        totalSize += result.size;
        console.log(`              ✅ Generated: ${result.path} (${result.size}KB)`);
        progress.completed.push(filename);

        // Remove from failed if it was there
        progress.failed = progress.failed.filter(f => f !== filename);
      } else {
        console.log(`              ❌ No image returned`);
        if (!progress.failed.includes(filename)) {
          progress.failed.push(filename);
        }
      }
    } catch (e) {
      console.log(`              ❌ Error: ${e.message.substring(0, 60)}`);
      if (!progress.failed.includes(filename)) {
        progress.failed.push(filename);
      }
    }

    saveProgress(progress);

    // Rate limit - 3 seconds between requests
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Summary:');
  console.log(`   ✅ Completed: ${progress.completed.length}`);
  console.log(`   ❌ Failed: ${progress.failed.length}`);
  console.log(`   ⏭️  Skipped: ${progress.skipped.length}`);
  console.log(`   📦 Total size this run: ${Math.round(totalSize / 1024)}MB`);
  console.log(`   📏 Avg size per image: ${Math.round(totalSize / count)}KB`);

  if (progress.failed.length > 0) {
    console.log('\n❌ Failed files (can retry):');
    progress.failed.forEach(f => console.log(`   - ${f}`));
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
