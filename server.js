import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const port = process.env.PORT || process.env.EXPOSED_PORT || 8092;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const nextBin = join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const args = [nextBin, 'start', '-p', String(port)];

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
