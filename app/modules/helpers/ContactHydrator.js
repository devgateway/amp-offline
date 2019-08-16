import { FieldPathConstants } from 'amp-ui';
import AbstractEntityHydrator from './AbstractEntityHydrator';

/**
 * Converts a contact Similar to ActivityHydrator,
 *
 * @author Nadejda Mandrescu
 */
export default class ContactHydrator extends AbstractEntityHydrator {
  constructor(fieldsDef) {
    super(fieldsDef, FieldPathConstants.PREFIX_CONTACT);
  }

}
