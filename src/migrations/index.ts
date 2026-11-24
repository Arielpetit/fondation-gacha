import * as migration_20261124_155630_baseline from './20261124_155630_baseline';

export const migrations = [
  {
    up: migration_20261124_155630_baseline.up,
    down: migration_20261124_155630_baseline.down,
    name: '20261124_155630_baseline'
  },
];
