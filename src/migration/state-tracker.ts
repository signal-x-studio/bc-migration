
import fs from 'fs';
import path from 'path';

interface MigrationState {
  lastRun: {
    [key: string]: string; // ISO8601 timestamp
  };
}

export class StateTracker {
  private stateFile: string;
  private state: MigrationState;

  constructor() {
    this.stateFile = path.resolve(process.cwd(), '.migration-state.json');
    this.state = this.loadState();
  }

  private loadState(): MigrationState {
    if (fs.existsSync(this.stateFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
      } catch (e) {
        console.warn('Failed to parse migration state file, starting fresh.');
      }
    }
    return { lastRun: {} };
  }

  private saveState() {
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }

  getLastRun(type: string): string | null {
    return this.state.lastRun[type] || null;
  }

  setLastRun(type: string, timestamp: string = new Date().toISOString()) {
    this.state.lastRun[type] = timestamp;
    this.saveState();
  }
}
