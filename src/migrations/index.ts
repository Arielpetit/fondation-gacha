import * as migration_20261124_162906_baseline from './20261124_162906_baseline';

export const migrations = [
  {
    up: migration_20261124_162906_baseline.up,
    down: migration_20261124_162906_baseline.down,
    name: '20261124_162906_baseline'
  },
];
