import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const SRC_DIR = path.join(__dirname, '..', 'src');

interface DocAudit {
  existing: {
    personas: string[];
    topics: string[];
    features: string[];
  };
  gaps: {
    personas: string[];
    topics: string[];
    features: string[];
    architecture: string[];
    strategy: string[];
  };
  opportunities: {
    fromCode: string[];
    fromDashboard: string[];
    fromCLI: string[];
  };
}

function auditDocumentation(): DocAudit {
  const audit: DocAudit = {
    existing: {
      personas: [],
      topics: [],
      features: [],
    },
    gaps: {
      personas: [],
      topics: [],
      features: [],
      architecture: [],
      strategy: [],
    },
    opportunities: {
      fromCode: [],
      fromDashboard: [],
      fromCLI: [],
    },
  };

  // 1. Analyze existing docs structure
  const existingDocs = new Map<string, string[]>();
  function collectDocs(dir: string, basePath: string[] = []): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        collectDocs(path.join(dir, entry.name), [...basePath, entry.name]);
      } else if (entry.name.endsWith('.html')) {
        const category = basePath[0] || 'root';
        if (!existingDocs.has(category)) {
          existingDocs.set(category, []);
        }
        existingDocs.get(category)!.push([...basePath, entry.name.replace('.html', '')].join('/'));
      }
    }
  }
  collectDocs(DOCS_DIR);

  // 2. Identify existing personas
  const personaFiles = existingDocs.get('getting-started') || [];
  personaFiles.forEach(file => {
    if (file.includes('for-merchants')) audit.existing.personas.push('Merchant/Store Owner');
    if (file.includes('for-developers')) audit.existing.personas.push('Developer/Engineer');
    if (file.includes('for-stakeholders')) audit.existing.personas.push('Product Manager/Stakeholder');
  });

  // 3. Analyze dashboard features
  const dashboardFeatures: string[] = [];
  const dashboardPages = [
    'products', 'categories', 'customers', 'orders',
    'seo', 'plugins', 'custom-data', 'migrate', 'preview',
    'validate', 'export', 'redirects', 'paths', 'go-live',
    'settings', 'help', 'wordpress', 'demo'
  ];
  dashboardPages.forEach(page => {
    const pagePath = path.join(SRC_DIR, 'dashboard', 'app', page);
    if (fs.existsSync(pagePath)) {
      dashboardFeatures.push(page);
    }
  });

  // 4. Analyze CLI commands
  const cliFile = path.join(SRC_DIR, 'cli.ts');
  if (fs.existsSync(cliFile)) {
    const cliContent = fs.readFileSync(cliFile, 'utf-8');
    const commands = cliContent.match(/\.command\(['"]([^'"]+)['"]/g) || [];
    commands.forEach(cmd => {
      const cmdName = cmd.match(/['"]([^'"]+)['"]/)?.[1];
      if (cmdName) audit.opportunities.fromCLI.push(cmdName);
    });
  }

  // 5. Analyze API routes
  const apiRoutes: string[] = [];
  const apiDir = path.join(SRC_DIR, 'dashboard', 'app', 'api');
  if (fs.existsSync(apiDir)) {
    function scanApiRoutes(dir: string, basePath: string[] = []): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          scanApiRoutes(path.join(dir, entry.name), [...basePath, entry.name]);
        } else if (entry.name === 'route.ts') {
          apiRoutes.push('/api/' + basePath.join('/'));
        }
      }
    }
    scanApiRoutes(apiDir);
  }

  // 6. Identify gaps
  const migrationPhases = ['Foundation', 'Core Data', 'Transactions', 'Content'];
  const migrationPhasesDocs = existingDocs.get('guides')?.filter(d => d.includes('migration')) || [];
  migrationPhases.forEach(phase => {
    if (!migrationPhasesDocs.some(d => d.toLowerCase().includes(phase.toLowerCase()))) {
      audit.gaps.features.push(`Migration Phase: ${phase}`);
    }
  });

  // Missing personas
  const potentialPersonas = [
    'WordPress Developer',
    'DevOps Engineer',
    'QA/Testing Engineer',
    'Support/Help Desk',
    'Project Manager',
    'Technical Writer',
    'Sales Engineer',
    'Solution Architect'
  ];
  potentialPersonas.forEach(persona => {
    if (!audit.existing.personas.some(p => p.toLowerCase().includes(persona.toLowerCase()))) {
      audit.gaps.personas.push(persona);
    }
  });

  // Dashboard features not documented
  const documentedFeatures = [
    'assessment', 'migration', 'validation', 'troubleshooting',
    'installation', 'configuration'
  ];
  dashboardFeatures.forEach(feature => {
    if (!documentedFeatures.some(df => feature.includes(df))) {
      audit.opportunities.fromDashboard.push(feature);
    }
  });

  // Architecture gaps
  const architectureTopics = [
    'Rate Limiting Strategy',
    'Error Handling Patterns',
    'State Management',
    'Caching Strategy',
    'API Client Architecture',
    'Data Transformation Pipeline',
    'Validation Framework',
    'Logging and Monitoring'
  ];
  architectureTopics.forEach(topic => {
    const archDocs = existingDocs.get('platform')?.filter(d => 
      d.toLowerCase().includes('architecture') || d.toLowerCase().includes('engine')
    ) || [];
    if (!archDocs.some(d => d.toLowerCase().includes(topic.toLowerCase().split(' ')[0]))) {
      audit.gaps.architecture.push(topic);
    }
  });

  // Strategy gaps
  const strategyTopics = [
    'Migration Planning',
    'Risk Assessment',
    'Rollback Strategy',
    'Performance Optimization',
    'Cost Analysis',
    'Timeline Estimation',
    'Resource Planning',
    'Success Metrics'
  ];
  strategyTopics.forEach(topic => {
    const strategyDocs = existingDocs.get('resources')?.filter(d => 
      d.toLowerCase().includes('strategy') || d.toLowerCase().includes('roadmap')
    ) || [];
    if (!strategyDocs.some(d => d.toLowerCase().includes(topic.toLowerCase().split(' ')[0]))) {
      audit.gaps.strategy.push(topic);
    }
  });

  return audit;
}

function generateReport(audit: DocAudit): string {
  let report = '# Documentation Audit Report\n\n';
  report += '## Existing Documentation\n\n';
  
  report += '### Personas Served\n';
  audit.existing.personas.forEach(p => {
    report += `- ${p}\n`;
  });
  report += '\n';

  report += '## Documentation Gaps\n\n';

  report += '### Missing Personas\n';
  if (audit.gaps.personas.length === 0) {
    report += '- None identified\n';
  } else {
    audit.gaps.personas.forEach(p => {
      report += `- **${p}**: No dedicated getting-started guide\n`;
    });
  }
  report += '\n';

  report += '### Missing Features Documentation\n';
  if (audit.gaps.features.length === 0) {
    report += '- None identified\n';
  } else {
    audit.gaps.features.forEach(f => {
      report += `- ${f}\n`;
    });
  }
  report += '\n';

  report += '### Architecture Documentation Gaps\n';
  if (audit.gaps.architecture.length === 0) {
    report += '- None identified\n';
  } else {
    audit.gaps.architecture.forEach(a => {
      report += `- ${a}\n`;
    });
  }
  report += '\n';

  report += '### Strategy Documentation Gaps\n';
  if (audit.gaps.strategy.length === 0) {
    report += '- None identified\n';
  } else {
    audit.gaps.strategy.forEach(s => {
      report += `- ${s}\n`;
    });
  }
  report += '\n';

  report += '## Opportunities from Codebase\n\n';

  report += '### Dashboard Features to Document\n';
  if (audit.opportunities.fromDashboard.length === 0) {
    report += '- None identified\n';
  } else {
    audit.opportunities.fromDashboard.forEach(f => {
      report += `- **${f}**: Dashboard feature exists but may lack documentation\n`;
    });
  }
  report += '\n';

  report += '### CLI Commands to Document\n';
  if (audit.opportunities.fromCLI.length === 0) {
    report += '- None identified\n';
  } else {
    audit.opportunities.fromCLI.forEach(c => {
      report += `- **${c}**: Command exists in CLI, ensure it's fully documented\n`;
    });
  }
  report += '\n';

  return report;
}

const audit = auditDocumentation();
const report = generateReport(audit);
console.log(report);

// Also write to file
const reportPath = path.join(__dirname, '..', 'docs-audit-report.md');
fs.writeFileSync(reportPath, report);
console.log(`\n✅ Full report written to: ${reportPath}`);

