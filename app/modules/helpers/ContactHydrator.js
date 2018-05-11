import AbstractEntityHydrator from './AbstractEntityHydrator';
import { PREFIX_CONTACT } from '../../utils/constants/FieldPathConstants';

/**
 * Converts a contact Similar to ActivityHydrator,
 *
 * @author Nadejda Mandrescu
 */
export default class ContactHydrator extends AbstractEntityHydrator {
  constructor(fieldsDef) {
    super(fieldsDef, PREFIX_CONTACT);
  }

  /*
  _getPossibleValues(fieldPaths = []) {
    fieldPaths.push(...this._fieldsDef.map(f => `${CONTACT}~${f.field_name}`));
    return super._getPossibleValues(fieldPaths).then(pvs => {
      pvs.forEach(pv => (pv.id = pv.id.substring(CONTACT.length + 1)));
      return pvs;
    });
  }
  */

}
