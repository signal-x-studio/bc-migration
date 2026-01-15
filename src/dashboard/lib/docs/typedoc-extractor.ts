/**
 * TypeDoc Extractor
 * Extracts documentation from TypeScript source files using TypeDoc JSON output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TypeDocReflection {
  id: number;
  name: string;
  kind: number;
  kindString: string;
  comment?: {
    shortText?: string;
    text?: string;
    summary?: Array<{ kind: string; text: string }>;
    tags?: Array<{
      tag: string;
      text: string;
    }>;
  };
  children?: TypeDocReflection[];
  signatures?: Array<{
    name: string;
    kind: number;
    comment?: TypeDocReflection['comment'];
    parameters?: Array<{
      name: string;
      type?: { type: string; name?: string };
      comment?: TypeDocReflection['comment'];
      flags?: { isOptional?: boolean };
    }>;
    type?: {
      type: string;
      name?: string;
      elementType?: { name: string };
    };
  }>;
  type?: {
    type: string;
    name?: string;
    elementType?: { name: string };
    declaration?: TypeDocReflection;
  };
  sources?: Array<{
    fileName: string;
    line: number;
  }>;
  groups?: Array<{
    title: string;
    children: number[];
  }>;
}

export interface TypeDocJSON {
  id: number;
  name: string;
  kind: number;
  kindString: string;
  children?: TypeDocReflection[];
}

/**
 * Load TypeDoc JSON output
 */
export function loadTypeDocJSON(jsonPath: string): TypeDocJSON | null {
  try {
    if (!fs.existsSync(jsonPath)) {
      console.warn(`TypeDoc JSON not found at ${jsonPath}`);
      return null;
    }
    const content = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(content) as TypeDocJSON;
  } catch (error) {
    console.error(`Error loading TypeDoc JSON:`, error);
    return null;
  }
}

/**
 * Find reflection by name in the tree
 */
export function findReflection(
  root: TypeDocReflection | TypeDocJSON,
  name: string,
  kindString?: string
): TypeDocReflection | null {
  if (root.name === name && (!kindString || root.kindString === kindString)) {
    return root as TypeDocReflection;
  }

  if ('children' in root && root.children) {
    for (const child of root.children) {
      const found = findReflection(child, name, kindString);
      if (found) return found;
    }
  }

  return null;
}

// TypeDoc kind constants
const KIND_CLASS = 128;
const KIND_INTERFACE = 256;
const KIND_FUNCTION = 64;
const KIND_TYPE_ALIAS = 4194304;

/**
 * Extract all classes from TypeDoc output
 */
export function extractClasses(root: TypeDocJSON): TypeDocReflection[] {
  const classes: TypeDocReflection[] = [];

  function traverse(node: TypeDocReflection | TypeDocJSON) {
    // Check kind number (TypeDoc uses numbers, not kindString in JSON)
    if (node.kind === KIND_CLASS) {
      classes.push(node as TypeDocReflection);
    }

    if ('children' in node && node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  if (root.children) {
    for (const child of root.children) {
      traverse(child);
    }
  }

  return classes;
}

/**
 * Extract all functions from TypeDoc output (standalone functions, not methods)
 */
export function extractFunctions(root: TypeDocJSON): TypeDocReflection[] {
  const functions: TypeDocReflection[] = [];

  function traverse(node: TypeDocReflection | TypeDocJSON) {
    // Only extract standalone functions (kind 64), not methods (which are inside classes)
    if (node.kind === KIND_FUNCTION) {
      functions.push(node as TypeDocReflection);
    }

    if ('children' in node && node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  if (root.children) {
    for (const child of root.children) {
      traverse(child);
    }
  }

  return functions;
}

/**
 * Extract all interfaces from TypeDoc output
 */
export function extractInterfaces(root: TypeDocJSON): TypeDocReflection[] {
  const interfaces: TypeDocReflection[] = [];

  function traverse(node: TypeDocReflection | TypeDocJSON) {
    if (node.kind === KIND_INTERFACE) {
      interfaces.push(node as TypeDocReflection);
    }

    if ('children' in node && node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  if (root.children) {
    for (const child of root.children) {
      traverse(child);
    }
  }

  return interfaces;
}

/**
 * Extract all type aliases from TypeDoc output
 */
export function extractTypeAliases(root: TypeDocJSON): TypeDocReflection[] {
  const types: TypeDocReflection[] = [];

  function traverse(node: TypeDocReflection | TypeDocJSON) {
    if (node.kind === KIND_TYPE_ALIAS) {
      types.push(node as TypeDocReflection);
    }

    if ('children' in node && node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  if (root.children) {
    for (const child of root.children) {
      traverse(child);
    }
  }

  return types;
}

/**
 * Get module name from file path
 */
export function getModuleName(filePath: string, rootDir: string = process.cwd()): string {
  const relative = path.relative(rootDir, filePath);
  return relative.replace(/\.ts$/, '').replace(/\\/g, '/');
}

/**
 * Extract JSDoc comment text
 */
export function extractComment(comment?: TypeDocReflection['comment']): string {
  if (!comment) return '';
  
  // Handle comment structure from TypeDoc JSON
  // Comments can have summary (array of content blocks) or shortText/text
  let text = '';
  
  if ('summary' in comment && comment.summary && Array.isArray(comment.summary)) {
    // TypeDoc uses summary as array of {kind: string, text: string}
    text = comment.summary.map((item: any) => item.text || '').join('').trim();
  } else if (comment.shortText) {
    text = comment.shortText;
  } else if (typeof comment.text === 'string') {
    text = comment.text;
  }
  
  return text.trim();
}

/**
 * Format type for display
 */
export function formatType(type?: TypeDocReflection['type'] | any): string {
  if (!type) return 'any';
  
  // Handle reference types (including generics)
  if (type.type === 'reference' || (type.name && !type.type)) {
    const name = type.name || 'unknown';
    // Check for type arguments (generics)
    if (type.typeArguments && Array.isArray(type.typeArguments) && type.typeArguments.length > 0) {
      const args = type.typeArguments.map((arg: any) => {
        // Try to get name directly first
        if (arg.name) {
          return arg.name;
        }
        // If it's a reference with a target
        if (arg.type === 'reference' && arg.target) {
          // target might be a number (ID) or an object with name
          if (typeof arg.target === 'number') {
            // Can't resolve ID references without full TypeDoc data, but try name if available
            return arg.name || 'unknown';
          }
          return arg.target.name || arg.target.qualifiedName || arg.name || 'unknown';
        }
        // Try to format it recursively
        return formatType(arg);
      }).join(', ');
      return `${name}<${args}>`;
    }
    return name;
  }
  
  // Handle arrays
  if (type.type === 'array' && type.elementType) {
    return `${formatType(type.elementType)}[]`;
  }
  
  // Handle unions
  if (type.type === 'union' && 'types' in type) {
    const types = (type as any).types as TypeDocReflection['type'][];
    return types.map(formatType).join(' | ');
  }
  
  // Handle intrinsic types
  if (type.type === 'intrinsic') {
    return type.name || 'any';
  }
  
  // Handle literal types
  if (type.type === 'literal') {
    return typeof type.value === 'string' ? `"${type.value}"` : String(type.value);
  }
  
  // Fallback
  return type.name || type.type || 'any';
}

