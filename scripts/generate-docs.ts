#!/usr/bin/env tsx

/**
 * Documentation Generation Script
 * Run this script to generate API reference documentation from TypeScript source
 */

// Use dynamic import to load the generator module
const generateDocsModule = await import('../src/dashboard/lib/docs/generator.js');
const { generateDocs } = generateDocsModule;

async function main() {
  try {
    await generateDocs();
    process.exit(0);
  } catch (error: any) {
    console.error('Documentation generation failed:', error.message || error);
    process.exit(1);
  }
}

main();
