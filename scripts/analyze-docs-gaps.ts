import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const SRC_DIR = path.join(__dirname, '..', 'src');

/**
 * Analyze documentation gaps and identify content that should be generated from source code
 */
function analyzeDocsGaps() {
  console.log('📊 Analyzing Documentation Gaps\n');

  // 1. Check what HTML files exist
  const existingDocs = new Set<string>();
  function collectDocs(dir: string, basePath: string[] = []): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        collectDocs(path.join(dir, entry.name), [...basePath, entry.name]);
      } else if (entry.name.endsWith('.html')) {
        const docPath = [...basePath, entry.name.replace('.html', '')].join('/');
        existingDocs.add(docPath);
      }
    }
  }
  collectDocs(DOCS_DIR);

  // 2. Check source code for API documentation opportunities
  const apiFiles: string[] = [];
  const cliFiles: string[] = [];
  const typeFiles: string[] = [];

  function scanSource(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        scanSource(fullPath);
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('export') || content.includes('interface') || content.includes('class')) {
          if (fullPath.includes('/api/')) {
            apiFiles.push(fullPath);
          } else if (fullPath.includes('cli') || fullPath.includes('command')) {
            cliFiles.push(fullPath);
          } else if (fullPath.includes('/types/') || fullPath.includes('/schemas/')) {
            typeFiles.push(fullPath);
          }
        }
      }
    }
  }
  scanSource(SRC_DIR);

  // 3. Check for README files that could be converted
  const readmeFiles: string[] = [];
  function findReadmes(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        findReadmes(fullPath);
      } else if (entry.name === 'README.md') {
        readmeFiles.push(fullPath);
      }
    }
  }
  findReadmes(path.join(__dirname, '..'));

  // 4. Report findings
  console.log('✅ Existing Documentation:');
  console.log(`   ${existingDocs.size} HTML files found\n`);

  console.log('📝 Source Code Analysis:');
  console.log(`   API Files: ${apiFiles.length}`);
  console.log(`   CLI Files: ${cliFiles.length}`);
  console.log(`   Type/Schema Files: ${typeFiles.length}`);
  console.log(`   README Files: ${readmeFiles.length}\n`);

  console.log('🔍 Potential Documentation Gaps:\n');

  // Check if API reference docs exist
  const hasWCApiDoc = existingDocs.has('reference/api/woocommerce-api');
  const hasBCApiDoc = existingDocs.has('reference/api/bigcommerce-api');
  
  if (!hasWCApiDoc || !hasBCApiDoc) {
    console.log('⚠️  API Reference Documentation:');
    if (!hasWCApiDoc) console.log('   - Missing: WooCommerce API reference');
    if (!hasBCApiDoc) console.log('   - Missing: BigCommerce API reference');
    console.log('   💡 Generate from: src/assessment/wc-client.ts, src/bigcommerce/bc-client.ts\n');
  }

  // Check CLI commands doc
  const hasCLIDoc = existingDocs.has('reference/cli/commands');
  if (!hasCLIDoc || fs.statSync(path.join(DOCS_DIR, 'reference/cli/commands.html')).size < 1000) {
    console.log('⚠️  CLI Commands Documentation:');
    console.log('   - May be incomplete or missing');
    console.log('   💡 Generate from: src/cli.ts\n');
  }

  // Check for missing type/schema docs
  if (typeFiles.length > 0) {
    const hasSchemaDoc = existingDocs.has('reference/schemas/data-models');
    if (!hasSchemaDoc || fs.statSync(path.join(DOCS_DIR, 'reference/schemas/data-models.html')).size < 1000) {
      console.log('⚠️  Data Model Documentation:');
      console.log('   - Type definitions and schemas may not be documented');
      console.log('   💡 Generate from: src/types/, src/schemas/\n');
    }
  }

  // Check README files
  console.log('📚 README Files Found:');
  readmeFiles.forEach(rm => {
    const relPath = path.relative(path.join(__dirname, '..'), rm);
    console.log(`   - ${relPath}`);
  });
  console.log('   💡 Consider converting to HTML docs\n');

  console.log('🎯 Recommendations:');
  console.log('   1. Generate API reference from source code JSDoc comments');
  console.log('   2. Extract CLI command documentation from src/cli.ts');
  console.log('   3. Generate type/schema documentation from TypeScript interfaces');
  console.log('   4. Convert README.md files to HTML documentation');
  console.log('   5. Add examples and usage patterns from source code\n');
}

analyzeDocsGaps();

