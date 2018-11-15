import Changeset from './Changeset';
import * as MC from '../../../utils/constants/MigrationsConstants';

/**
 * Migrations context helper
 *
 * @author Nadejda Mandrescu
 */
const Context = {
  matches(context: string, c: Changeset) {
    return c.context.includes(context) || c.context.includes(MC.CONTEXT_ALL);
  },
};

export default Context;
