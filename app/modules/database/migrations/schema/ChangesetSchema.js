import * as MC from '../../../../utils/constants/MigrationsConstants';
import { ChangeSetPreconditions } from './PreConditionSchema';
import ChangeRollbackSchema from './ChangeRollbackSchema';

export default ({
  id: '/ChangesetSchema',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    changeid: {
      type: 'string'
    },
    author: {
      type: 'string'
    },
    context: {
      oneOf: [
        {
          type: 'array',
          items: {
            type: 'string',
            enum: MC.CONTEXT_OPTIONS,
          },
          uniqueItems: true
        },
        {
          type: 'string',
          enum: MC.CONTEXT_OPTIONS,
        }
      ]
    },
    runAlways: {
      type: 'boolean'
    },
    runOnChange: {
      type: 'boolean'
    },
    failOnError: {
      type: 'boolean'
    },
    comment: {
      type: 'string'
    },
    preConditions: ChangeSetPreconditions,
    changes: {
      type: 'array',
      items: ChangeRollbackSchema,
    },
    rollback: ChangeRollbackSchema
  },
  required: [MC.CHANGEID, MC.AUTHOR, MC.CHANGES],
  additionalProperties: false
});
