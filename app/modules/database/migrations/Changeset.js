import * as MC from '../../../utils/constants/MigrationsConstants';
import * as Utils from '../../../utils/Utils';

/**
 * Stores changeset definition and provides defaults when some fields are not explicitly configured.
 * It also offers other supporting methods like generating MD5 hash, validation against schema check.
 *
 * @author Nadejda Mandrescu
 */
export default class Changeset {
  constructor(origMigration, changelog) {
    this._origMigration = origMigration;
    this._changelog = changelog;
    this._migration = Changeset._cloneWithDefaults(origMigration);
  }

  get migration() {
    return this._migration;
  }

  static _cloneWithDefaults(origMigration) {
    const m = Utils.cloneDeep(origMigration);
    Changeset._setDefaultIfUndefined(m, MC.COMMENT, MC.DEFAULT_CONTEXT);
    Changeset._setDefaultIfUndefined(m, MC.RUN_ALWAYS, MC.DEFAULT_RUN_ALWAYS);
    Changeset._setDefaultIfUndefined(m, MC.RUN_ON_CHANGE, MC.DEFAULT_RUN_ON_CHANGE);
    Changeset._setDefaultIfUndefined(m, MC.FAIL_ON_ERROR, MC.DEFAULT_FAIL_ON_ERROR);

    Changeset.setDefaultsForPreconditions(m[MC.PRECONDITIONS]);

    return m;
  }

  static setDefaultsForPreconditions(pcs) {
    if (pcs && pcs.length) {
      pcs.forEach(pc => {
        Changeset._setDefaultIfUndefined(pc, MC.ON_FAIL, MC.DEFAULT_ON_FAIL_ERROR);
        Changeset._setDefaultIfUndefined(pc, MC.ON_ERROR, MC.DEFAULT_ON_FAIL_ERROR);
      });
    }
  }

  static _setDefaultIfUndefined(parent, field, defaultValue) {
    if (parent[field] === undefined) {
      parent[field] = defaultValue;
    }
  }

}
