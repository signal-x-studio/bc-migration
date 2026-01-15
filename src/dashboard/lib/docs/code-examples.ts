/**
 * Code Example Extractor
 * Extracts code snippets from source files for documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

/**
 * Extract code snippet from a file
 */
export function extractCodeSnippet(
  filePath: string,
  startLine?: number,
  endLine?: number
): string | null {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return null;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    if (startLine === undefined && endLine === undefined) {
      return content;
    }

    const start = startLine !== undefined ? Math.max(0, startLine - 1) : 0;
    const end = endLine !== undefined ? Math.min(lines.length, endLine) : lines.length;

    return lines.slice(start, end).join('\n');
  } catch (error) {
    console.error(`Error extracting code from ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract code between markers (e.g., // BEGIN and // END)
 */
export function extractCodeBetweenMarkers(
  filePath: string,
  startMarker: string,
  endMarker: string
): string | null {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return null;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(startMarker)) {
        startIndex = i + 1; // Start after the marker line
      }
      if (lines[i].includes(endMarker)) {
        endIndex = i;
        break;
      }
    }

    if (startIndex === -1 || endIndex === -1) {
      console.warn(`Markers not found in ${filePath}`);
      return null;
    }

    return lines.slice(startIndex, endIndex).join('\n').trim();
  } catch (error) {
    console.error(`Error extracting code from ${filePath}:`, error);
    return null;
  }
}

/**
 * Get file language from extension
 */
export function getLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath);
  const langMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.json': 'json',
    '.md': 'markdown',
    '.mdx': 'mdx',
    '.php': 'php',
    '.css': 'css',
    '.html': 'html',
    '.bash': 'bash',
    '.sh': 'bash',
  };

  return langMap[ext] || 'text';
}

