/**
 * Build distribution ZIP file
 *
 * @package BC_Bridge
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get plugin version from main plugin file.
const pluginFile = fs.readFileSync(path.join(__dirname, '..', 'bc-bridge.php'), 'utf8');
const versionMatch = pluginFile.match(/Version:\s*(\S+)/);
const version = versionMatch ? versionMatch[1] : '1.0.0';

const pluginName = 'bc-bridge';
const distDir = path.join(__dirname, '..', 'dist');
const buildDir = path.join(__dirname, '..', 'build');
const zipName = `${pluginName}-${version}.zip`;

// Files and directories to include in the ZIP.
const includeFiles = [
    'bc-bridge.php',
    'admin',
    'assets',
    'includes',
    'languages',
    'templates',
];

// Files to exclude from ZIP.
const excludePatterns = [
    '*.map',
    '.DS_Store',
    '*.log',
    'node_modules',
    '.git',
];

console.log(`Building ${pluginName} v${version}...`);

// Create dist directory.
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Create build directory.
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(path.join(buildDir, pluginName), { recursive: true });

// Copy files to build directory.
const pluginDir = path.join(__dirname, '..');

includeFiles.forEach(file => {
    const src = path.join(pluginDir, file);
    const dest = path.join(buildDir, pluginName, file);

    if (fs.existsSync(src)) {
        if (fs.statSync(src).isDirectory()) {
            copyDirSync(src, dest);
        } else {
            fs.copyFileSync(src, dest);
        }
        console.log(`  Copied: ${file}`);
    } else {
        console.log(`  Skipped (not found): ${file}`);
    }
});

// Copy optional files.
['readme.txt', 'LICENSE', 'CHANGELOG.md'].forEach(file => {
    const src = path.join(pluginDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(buildDir, pluginName, file));
        console.log(`  Copied: ${file}`);
    }
});

// Create ZIP file.
const zipPath = path.join(distDir, zipName);
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

try {
    execSync(`cd "${buildDir}" && zip -r "${zipPath}" "${pluginName}"`, { stdio: 'inherit' });
    console.log(`\nCreated: ${zipPath}`);
} catch (error) {
    console.error('Failed to create ZIP file:', error.message);
    process.exit(1);
}

// Cleanup build directory.
fs.rmSync(buildDir, { recursive: true });

// Show ZIP info.
const stats = fs.statSync(zipPath);
const sizeKB = (stats.size / 1024).toFixed(2);
console.log(`Size: ${sizeKB} KB`);
console.log('\nDone!');

/**
 * Recursively copy directory.
 *
 * @param {string} src Source path.
 * @param {string} dest Destination path.
 */
function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Skip excluded patterns.
        if (shouldExclude(entry.name)) {
            continue;
        }

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Check if file should be excluded.
 *
 * @param {string} filename Filename to check.
 * @return {boolean} Whether to exclude.
 */
function shouldExclude(filename) {
    return excludePatterns.some(pattern => {
        if (pattern.startsWith('*')) {
            return filename.endsWith(pattern.slice(1));
        }
        return filename === pattern;
    });
}
