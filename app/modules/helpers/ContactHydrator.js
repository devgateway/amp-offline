import AbstractEntityHydrator from './AbstractEntityHydrator';
import { CONTACT } from '../../utils/constants/ActivityConstants';

/**
 * Converts a contact Similar to ActivityHydrator,
 *
 * @author Nadejda Mandrescu
 */
export default class ContactHydrator extends AbstractEntityHydrator {

  _getPossibleValues(fieldPaths = []) {
    fieldPaths.push(...this._fieldsDef.map(f => `${CONTACT}~${f.field_name}`));
    return super._getPossibleValues(fieldPaths).then(pvs => {
      pvs.forEach(pv => (pv.id = pv.id.substring(CONTACT.length + 1)));
      return pvs;
    });
  }

}
