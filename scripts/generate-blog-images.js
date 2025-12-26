#!/usr/bin/env node
/**
 * Generate custom blog feature images using Gemini 2.0 Flash (Nano Banana)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const GOOGLE_API_KEY = 'AIzaSyBV4eXRDZHqHjgMjScKC0h5oTyjKPZnKIU';
const BLOG_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog';
const OUTPUT_DIR = '/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/public/images/generated';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Extract frontmatter from MDX file
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      let value = keyMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      frontmatter[keyMatch[1]] = value;
    }
  }

  return frontmatter;
}

// Generate image prompt from blog post
function createImagePrompt(title, excerpt, category) {
  return `Create a sophisticated, editorial-style feature image for a blog post.

Title: "${title}"
${excerpt ? `Summary: "${excerpt}"` : ''}
${category ? `Category: ${category}` : ''}

Requirements:
- Professional, modern aesthetic suitable for a tech/business blog
- Abstract or conceptual representation of the theme
- Rich colors with good contrast
- No text or words in the image
- Avoid generic stock photo clichés
- 16:9 aspect ratio composition
- Style: Clean, minimalist, thought-provoking

Generate an image that captures the essence and mood of this blog post.`;
}

// Generate image using Gemini
async function generateImage(prompt, filename) {
  try {
    // Use Gemini 2.0 Flash for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['image', 'text'],
      }
    });

    console.log('  Generating image...');
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Check for image in response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const ext = mimeType.includes('png') ? 'png' : 'jpg';

        const outputPath = path.join(OUTPUT_DIR, `${filename}.${ext}`);
        fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
        console.log('  ✅ Saved:', outputPath);
        return `/images/generated/${filename}.${ext}`;
      }
    }

    console.log('  ⚠️ No image in response, got text:', response.text()?.substring(0, 100));
    return null;
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    return null;
  }
}

// Main function
async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Posts to regenerate (from audit results)
  const postsToFix = [
    'describe-the-pear.mdx',
    'the-ai-approach-reset.mdx',
    'the-storefront-that-builds-itself.mdx',
  ];

  // Or pass specific files as arguments
  const targetFiles = process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : postsToFix;

  console.log('🎨 Generating custom blog images using Gemini 2.0 Flash\n');

  for (const filename of targetFiles) {
    const filepath = path.join(BLOG_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️ File not found: ${filename}`);
      continue;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      console.log(`⚠️ No frontmatter in: ${filename}`);
      continue;
    }

    console.log(`\n📝 ${frontmatter.title || filename}`);

    const prompt = createImagePrompt(
      frontmatter.title,
      frontmatter.excerpt || frontmatter.metaDescription,
      frontmatter.category
    );

    const slug = filename.replace('.mdx', '');
    const imagePath = await generateImage(prompt, slug);

    if (imagePath) {
      console.log(`  New image path: ${imagePath}`);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
