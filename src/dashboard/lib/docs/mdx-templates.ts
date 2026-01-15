/**
 * MDX Templates for API Documentation
 * Generates MDX content from TypeDoc reflection data
 */

import type { TypeDocReflection } from './typedoc-extractor.js';
import { extractComment, formatType } from './typedoc-extractor.js';

// TypeDoc kind constants (numbers, not strings!)
const KIND_CONSTRUCTOR = 512;
const KIND_PROPERTY = 1024;
const KIND_METHOD = 2048;

/**
 * Generate MDX frontmatter
 */
export function generateFrontmatter(
  title: string,
  description: string,
  category: string,
  order: number = 999,
  section?: string
): string {
  const frontmatter: Record<string, any> = {
    title,
    description,
    category,
    order,
  };

  if (section) {
    frontmatter.section = section;
  }

  const entries = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  return `---\n${entries}\n---\n\n`;
}

/**
 * Generate MDX for a class
 */
export function generateClassMDX(reflection: TypeDocReflection, moduleName: string): string {
  const title = reflection.name;
  const description = extractComment(reflection.comment);
  const slug = `reference/api/${moduleName}/${reflection.name.toLowerCase()}`;
  
  let mdx = generateFrontmatter(
    title,
    description.split('\n')[0] || title,
    'reference',
    100,
    'api'
  );

  mdx += `# ${title}\n\n`;
  
  if (description) {
    mdx += `${description}\n\n`;
  }

  // Constructor
  const constructor = reflection.children?.find(c => c.kind === KIND_CONSTRUCTOR);
  if (constructor) {
    mdx += `## Constructor\n\n`;
    mdx += generateSignatureMDX(constructor);
  }

  // Properties
  const properties = reflection.children?.filter(c => c.kind === KIND_PROPERTY) || [];
  if (properties.length > 0) {
    mdx += `## Properties\n\n`;
    for (const prop of properties) {
      mdx += generatePropertyMDX(prop);
    }
  }

  // Methods
  const methods = reflection.children?.filter(c => c.kind === KIND_METHOD) || [];
  if (methods.length > 0) {
    mdx += `## Methods\n\n`;
    for (const method of methods) {
      mdx += generateMethodMDX(method);
    }
  }

  return mdx;
}

/**
 * Generate MDX for a function
 */
export function generateFunctionMDX(reflection: TypeDocReflection, moduleName: string): string {
  const title = reflection.name;
  const description = extractComment(reflection.comment);
  const signature = reflection.signatures?.[0];

  let mdx = generateFrontmatter(
    title,
    description.split('\n')[0] || title,
    'reference',
    200,
    'api'
  );

  mdx += `# ${title}\n\n`;
  
  if (description) {
    mdx += `${description}\n\n`;
  }

  if (signature) {
    mdx += generateSignatureMDX({ ...reflection, signatures: [signature] });
  }

  return mdx;
}

/**
 * Generate MDX for an interface
 */
export function generateInterfaceMDX(reflection: TypeDocReflection, moduleName: string): string {
  const title = reflection.name;
  const description = extractComment(reflection.comment);
  const properties = reflection.children?.filter(c => c.kind === KIND_PROPERTY) || [];

  let mdx = generateFrontmatter(
    title,
    description.split('\n')[0] || title,
    'reference',
    300,
    'api'
  );

  mdx += `# ${title}\n\n`;
  
  if (description) {
    mdx += `${description}\n\n`;
  }

  if (properties.length > 0) {
    mdx += `## Properties\n\n`;
    mdx += `| Name | Type | Description |\n`;
    mdx += `|------|------|-------------|\n`;
    
    for (const prop of properties) {
      const propDescription = extractComment(prop.comment);
      const propType = formatType(prop.type);
      mdx += `| \`${prop.name}\` | \`${propType}\` | ${propDescription || '-'} |\n`;
    }
    mdx += `\n`;
  }

  return mdx;
}

/**
 * Generate signature documentation
 */
function generateSignatureMDX(reflection: TypeDocReflection | { signatures?: TypeDocReflection['signatures'] }): string {
  const signature = 'signatures' in reflection ? reflection.signatures?.[0] : undefined;
  if (!signature) return '';

  let sig = `\`\`\`typescript\n`;
  
  // Build parameter list
  const params = signature.parameters?.map(p => {
    const optional = p.flags?.isOptional ? '?' : '';
    const paramType = formatType(p.type);
    return `${p.name}${optional}: ${paramType}`;
  }).join(', ') || '';

  const returnType = formatType(signature.type);
  sig += `${signature.name}(${params}): ${returnType}\n`;
  sig += `\`\`\`\n\n`;

  // Parameters documentation
  if (signature.parameters && signature.parameters.length > 0) {
    sig += `### Parameters\n\n`;
    for (const param of signature.parameters) {
      const paramDesc = extractComment(param.comment);
      const paramType = formatType(param.type);
      sig += `- **\`${param.name}\`** (\`${paramType}\`)${param.flags?.isOptional ? ' (optional)' : ''}: ${paramDesc || 'No description'}\n`;
    }
    sig += `\n`;
  }

  // Return type documentation
  if (signature.type) {
    sig += `### Returns\n\n`;
    sig += `\`${formatType(signature.type)}\`\n\n`;
  }

  return sig;
}

/**
 * Generate property documentation
 */
function generatePropertyMDX(reflection: TypeDocReflection): string {
  const description = extractComment(reflection.comment);
  const propType = formatType(reflection.type);

  let mdx = `### \`${reflection.name}\`\n\n`;
  mdx += `Type: \`${propType}\`\n\n`;
  
  if (description) {
    mdx += `${description}\n\n`;
  }

  return mdx;
}

/**
 * Generate method documentation
 */
function generateMethodMDX(reflection: TypeDocReflection): string {
  const description = extractComment(reflection.comment);
  const signature = reflection.signatures?.[0];

  let mdx = `### \`${reflection.name}()\`\n\n`;
  
  if (description) {
    mdx += `${description}\n\n`;
  }

  if (signature) {
    mdx += generateSignatureMDX({ signatures: [signature] });
  }

  return mdx;
}

/**
 * Generate CLI command documentation
 */
export function generateCLICommandMDX(command: {
  name: string;
  description: string;
  options?: Array<{
    flags: string;
    description: string;
    defaultValue?: string;
  }>;
  examples?: string[];
}): string {
  let mdx = generateFrontmatter(
    command.name,
    command.description,
    'reference',
    10,
    'cli'
  );

  mdx += `# ${command.name}\n\n`;
  mdx += `${command.description}\n\n`;

  if (command.options && command.options.length > 0) {
    mdx += `## Options\n\n`;
    mdx += `| Flag | Description | Default |\n`;
    mdx += `|------|-------------|---------|\n`;
    
    for (const opt of command.options) {
      mdx += `| \`${opt.flags}\` | ${opt.description} | ${opt.defaultValue || '-'} |\n`;
    }
    mdx += `\n`;
  }

  if (command.examples && command.examples.length > 0) {
    mdx += `## Examples\n\n`;
    for (const example of command.examples) {
      mdx += `\`\`\`bash\n${example}\n\`\`\`\n\n`;
    }
  }

  return mdx;
}

