import * as MC from '../../../../utils/constants/MigrationsConstants';
import { ChangeLogPreconditions } from './PreConditionSchema';
import ChangesetSchema from './ChangesetSchema';

export default ({
  id: '/ChangelogSchema',
  // note 'jsonschema' lib is mostly v04 compatible
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    changelog: {
      type: 'object',
      properties: {
        preConditions: ChangeLogPreconditions,
        changesets: {
          type: 'array',
          minItems: 1,
          items: ChangesetSchema
        }
      },
      additionalProperties: false,
      required: [MC.CHANGESETS]
    }
  },
  additionalProperties: false,
  required: [MC.CHANGELOG]
});
