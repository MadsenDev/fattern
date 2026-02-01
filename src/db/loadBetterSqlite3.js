function loadBetterSqlite3() {
  try {
    // Native module; must be compiled for Electron's Node ABI.
    return require('better-sqlite3');
  } catch (error) {
    const message = [
      'Failed to load the `better-sqlite3` native module.',
      '',
      'This usually means it was compiled for a different Node/Electron version.',
      'Fix: run `npm run electron:rebuild` (or reinstall dependencies).',
      '',
      `Original error: ${error && error.message ? error.message : String(error)}`,
    ].join('\n');

    const wrapped = new Error(message);
    wrapped.cause = error;
    throw wrapped;
  }
}

module.exports = { loadBetterSqlite3 };
