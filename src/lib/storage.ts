import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DashboardConfig, defaultConfig } from '@/lib/dashboardConfig';

const dataPrefix = process.env.DATA_PREFIX || 'homesweethome';
const isAddon = process.env.ADDON === 'true' || process.env.ADDON === '1';
const dataRoot = isAddon ? '/data' : path.join(process.cwd(), '.data');
const configPath = path.join(dataRoot, `${dataPrefix}-dashboard.json`);

export async function readDashboardConfig(): Promise<DashboardConfig> {
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(raw) as DashboardConfig;
  } catch (error) {
    await ensureDataDir();
    await writeDashboardConfig(defaultConfig);
    return defaultConfig;
  }
}

export async function writeDashboardConfig(config: DashboardConfig) {
  await ensureDataDir();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

async function ensureDataDir() {
  await fs.mkdir(dataRoot, { recursive: true });
}
