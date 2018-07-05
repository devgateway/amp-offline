import AbstractEntityHydrator from './AbstractEntityHydrator';
import { PREFIX_RESOURCE } from '../../utils/constants/FieldPathConstants';

/**
 * Hydrates a resource with full values, similarly to ActivityHydrator
 *
 * @author Nadejda Mandrescu
 */
export default class ResourceHydrator extends AbstractEntityHydrator {
  constructor(fieldsDef) {
    super(fieldsDef, PREFIX_RESOURCE);
  }

}
