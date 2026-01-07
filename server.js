import { spawn } from 'node:child_process';

const port = process.env.PORT || process.env.EXPOSED_PORT || 8092;
const args = ['start', '-p', String(port)];

const child = spawn('next', args, {
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
