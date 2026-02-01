const { spawnSync } = require('child_process');

function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error('Usage: node scripts/run-with-electron-node.js <script> [...args]');
    process.exit(2);
  }

  let electronBinary;
  try {
    electronBinary = require('electron');
  } catch (error) {
    console.error('electron is not installed. Run `npm install` first.');
    process.exit(1);
  }

  const args = [scriptPath, ...process.argv.slice(3)];
  const result = spawnSync(electronBinary, args, {
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
