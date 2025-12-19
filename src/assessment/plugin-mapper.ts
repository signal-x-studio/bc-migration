import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface PluginMapResult {
  plugin: string;
  recommendation: string;
  type: string;
  notes: string;
}

export class PluginMapper {
  private mappings: Record<string, any>;

  constructor() {
    const dataPath = path.join(__dirname, 'data', 'plugin-mappings.json');
    this.mappings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  map(activePlugins: any[]): PluginMapResult[] {
    const results: PluginMapResult[] = [];

    activePlugins.forEach(p => {
      const pluginSlug = p.plugin.split('/')[0].toLowerCase();
      if (this.mappings[pluginSlug]) {
        const mapping = this.mappings[pluginSlug];
        results.push({
          plugin: p.name,
          recommendation: mapping.target,
          type: mapping.type,
          notes: mapping.notes
        });
      }
    });

    return results;
  }
}
