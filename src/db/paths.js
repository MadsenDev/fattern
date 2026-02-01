const os = require('os');
const path = require('path');

const FATTERN_ROOT = process.env.FATTERN_ROOT || path.join(os.homedir(), 'Fattern');
const DATA_ROOT = path.join(FATTERN_ROOT, 'data');
const EXPORT_ROOT = path.join(FATTERN_ROOT, 'exports');
const LOG_ROOT = path.join(FATTERN_ROOT, 'logs');

module.exports = {
  FATTERN_ROOT,
  DATA_ROOT,
  EXPORT_ROOT,
  LOG_ROOT,
};
