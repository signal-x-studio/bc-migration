/**
 * Documentation Generator
 * Orchestrates TypeDoc extraction and MDX generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  loadTypeDocJSON,
  extractClasses,
  extractFunctions,
  extractInterfaces,
  extractTypeAliases,
  getModuleName,
  type TypeDocJSON,
} from './typedoc-extractor.js';
import {
  generateClassMDX,
  generateFunctionMDX,
  generateInterfaceMDX,
  generateCLICommandMDX,
} from './mdx-templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to project root
// From src/dashboard/lib/docs/generator.ts -> src/dashboard/lib/docs -> src/dashboard -> src -> root
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const DOCS_CONTENT_DIR = path.join(PROJECT_ROOT, 'docs/content');
const API_REF_DIR = path.join(PROJECT_ROOT, 'docs/api-reference');
const TYPEDOC_JSON_PATH = path.join(API_REF_DIR, 'typedoc.json');

/**
 * Generate documentation from TypeScript source files
 */
export async function generateDocs(): Promise<void> {
  console.log('📚 Generating documentation...\n');

  // Step 1: Run TypeDoc to generate JSON
  console.log('1️⃣  Running TypeDoc...');
  try {
    execSync('npx typedoc --options typedoc.json', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    console.log('✅ TypeDoc completed\n');
  } catch (error) {
    console.error('❌ TypeDoc failed:', error);
    throw error;
  }

  // Step 2: Load TypeDoc JSON
  console.log('2️⃣  Loading TypeDoc JSON...');
  const typeDocData = loadTypeDocJSON(TYPEDOC_JSON_PATH);
  if (!typeDocData) {
    throw new Error('Failed to load TypeDoc JSON output');
  }
  console.log('✅ TypeDoc JSON loaded\n');

  // Step 3: Generate API reference documentation
  console.log('3️⃣  Generating API reference documentation...');
  await generateAPIReference(typeDocData);
  console.log('✅ API reference generated\n');

  // Step 4: Generate CLI commands documentation
  console.log('4️⃣  Generating CLI commands documentation...');
  await generateCLIDocumentation();
  console.log('✅ CLI documentation generated\n');

  console.log('✨ Documentation generation complete!');
}

/**
 * Generate API reference documentation from TypeDoc data
 */
async function generateAPIReference(typeDocData: TypeDocJSON): Promise<void> {
  const apiRefDir = path.join(DOCS_CONTENT_DIR, 'reference/api');
  
  // Ensure directory exists
  if (!fs.existsSync(apiRefDir)) {
    fs.mkdirSync(apiRefDir, { recursive: true });
  }

  // Extract different types of reflections
  const classes = extractClasses(typeDocData);
  const functions = extractFunctions(typeDocData);
  const interfaces = extractInterfaces(typeDocData);
  const typeAliases = extractTypeAliases(typeDocData);

  // Group by module/source file
  const modules = new Map<string, {
    classes: typeof classes;
    functions: typeof functions;
    interfaces: typeof interfaces;
    types: typeof typeAliases;
  }>();

  // Group classes
  for (const cls of classes) {
    const source = cls.sources?.[0];
    if (source) {
      const moduleName = getModuleName(source.fileName, PROJECT_ROOT)
        .split('/')
        .slice(0, -1)
        .join('/');
      if (!modules.has(moduleName)) {
        modules.set(moduleName, { classes: [], functions: [], interfaces: [], types: [] });
      }
      modules.get(moduleName)!.classes.push(cls);
    }
  }

  // Group functions (standalone functions)
  for (const fn of functions) {
    const source = fn.sources?.[0];
    if (source && !fn.name.includes('.')) {
      const moduleName = getModuleName(source.fileName, PROJECT_ROOT)
        .split('/')
        .slice(0, -1)
        .join('/');
      if (!modules.has(moduleName)) {
        modules.set(moduleName, { classes: [], functions: [], interfaces: [], types: [] });
      }
      modules.get(moduleName)!.functions.push(fn);
    }
  }

  // Group interfaces
  for (const iface of interfaces) {
    const source = iface.sources?.[0];
    if (source) {
      const moduleName = getModuleName(source.fileName, PROJECT_ROOT)
        .split('/')
        .slice(0, -1)
        .join('/');
      if (!modules.has(moduleName)) {
        modules.set(moduleName, { classes: [], functions: [], interfaces: [], types: [] });
      }
      modules.get(moduleName)!.interfaces.push(iface);
    }
  }

  // Generate MDX files for each module
  for (const [moduleName, items] of modules.entries()) {
    const moduleDir = path.join(apiRefDir, moduleName);
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // Generate class documentation
    for (const cls of items.classes) {
      const mdx = generateClassMDX(cls, moduleName);
      const fileName = `${cls.name.toLowerCase()}.mdx`;
      const filePath = path.join(moduleDir, fileName);
      fs.writeFileSync(filePath, mdx);
      console.log(`  📄 Generated: ${path.relative(DOCS_CONTENT_DIR, filePath)}`);
    }

    // Generate function documentation
    for (const fn of items.functions) {
      const mdx = generateFunctionMDX(fn, moduleName);
      const fileName = `${fn.name.toLowerCase()}.mdx`;
      const filePath = path.join(moduleDir, fileName);
      fs.writeFileSync(filePath, mdx);
      console.log(`  📄 Generated: ${path.relative(DOCS_CONTENT_DIR, filePath)}`);
    }

    // Generate interface documentation
    for (const iface of items.interfaces) {
      const mdx = generateInterfaceMDX(iface, moduleName);
      const fileName = `${iface.name.toLowerCase()}.mdx`;
      const filePath = path.join(moduleDir, fileName);
      fs.writeFileSync(filePath, mdx);
      console.log(`  📄 Generated: ${path.relative(DOCS_CONTENT_DIR, filePath)}`);
    }
  }

  // Generate type definitions index
  if (typeAliases.length > 0) {
    const typesDir = path.join(apiRefDir, 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    for (const type of typeAliases) {
      const mdx = generateInterfaceMDX(type, 'types');
      const fileName = `${type.name.toLowerCase()}.mdx`;
      const filePath = path.join(typesDir, fileName);
      fs.writeFileSync(filePath, mdx);
      console.log(`  📄 Generated: ${path.relative(DOCS_CONTENT_DIR, filePath)}`);
    }
  }
}

/**
 * Generate CLI commands documentation by parsing cli.ts
 */
async function generateCLIDocumentation(): Promise<void> {
  const cliDir = path.join(DOCS_CONTENT_DIR, 'reference/cli');
  if (!fs.existsSync(cliDir)) {
    fs.mkdirSync(cliDir, { recursive: true });
  }

  // Parse CLI commands from src/cli.ts
  const cliPath = path.join(PROJECT_ROOT, 'src/cli.ts');
  if (!fs.existsSync(cliPath)) {
    console.warn('  ⚠️  CLI file not found, skipping CLI documentation');
    return;
  }

  // Generate CLI commands documentation
  // Note: In a full implementation, we'd parse commander.js definitions from cli.ts
  const commandsMDX = generateCLICommandMDX({
    name: 'bc-migrate',
    description: 'WooCommerce to BigCommerce Migration CLI Tool',
    options: [
      {
        flags: '-u, --url <url>',
        description: 'WooCommerce store URL',
      },
      {
        flags: '-k, --key <key>',
        description: 'WooCommerce Consumer Key',
      },
      {
        flags: '-s, --secret <secret>',
        description: 'WooCommerce Consumer Secret',
      },
      {
        flags: '--hash <hash>',
        description: 'BigCommerce Store Hash',
      },
      {
        flags: '--token <token>',
        description: 'BigCommerce Access Token',
      },
    ],
    examples: [
      'bc-migrate assess --url https://store.com --key ck_xxx --secret cs_xxx',
      'bc-migrate migrate --type=products',
      'bc-migrate validate',
    ],
  });

  const indexPath = path.join(cliDir, 'commands.mdx');
  fs.writeFileSync(indexPath, commandsMDX);
  console.log(`  📄 Generated: ${path.relative(DOCS_CONTENT_DIR, indexPath)}`);
}

