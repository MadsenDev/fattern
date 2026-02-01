const { spawnSync } = require('child_process');
const path = require('path');

function getElectronVersion() {
  try {
    // electron package ships its own package.json with a stable version string.
    return require('electron/package.json').version;
  } catch (error) {
    console.warn('electron is not installed; skipping Electron native rebuild.');
    return null;
  }
}

function main() {
  const electronVersion = getElectronVersion();
  if (!electronVersion) return;

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = [
    'rebuild',
    'better-sqlite3',
    `--runtime=electron`,
    `--target=${electronVersion}`,
    `--dist-url=https://electronjs.org/headers`,
  ];

  console.log(`Rebuilding native modules for Electron ${electronVersion}...`);
  const result = spawnSync(npmCmd, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Some sandboxed/dev environments block writing to ~/.npm/_logs.
      // Keep cache/logs inside the project so rebuild output is still available.
      npm_config_cache: process.env.npm_config_cache || path.join(process.cwd(), '.npm-cache'),
      npm_config_logs_dir: process.env.npm_config_logs_dir || path.join(process.cwd(), '.npm-logs'),
    },
  });

  if (result.error) {
    console.error('Failed to run npm rebuild:', result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
