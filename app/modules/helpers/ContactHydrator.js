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

}
