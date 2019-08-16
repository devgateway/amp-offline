import { FieldPathConstants } from 'amp-ui';
import AbstractEntityHydrator from './AbstractEntityHydrator';

/**
 * Hydrates a resource with full values, similarly to ActivityHydrator
 *
 * @author Nadejda Mandrescu
 */
export default class ResourceHydrator extends AbstractEntityHydrator {
  constructor(fieldsDef) {
    super(fieldsDef, FieldPathConstants.PREFIX_RESOURCE);
  }

}
