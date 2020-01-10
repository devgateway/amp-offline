import * as MC from '../../../../utils/constants/MigrationsConstants';

const commonProperties = (isChangeSet) => ({
  onFail: {
    type: 'string',
    enum: isChangeSet ? MC.ON_FAIL_ERROR_CHANGESET_OPTIONS : MC.ON_FAIL_ERROR_CHANGELOG_OPTIONS
  },
  onError: {
    type: 'string',
    enum: isChangeSet ? MC.ON_FAIL_ERROR_CHANGESET_OPTIONS : MC.ON_FAIL_ERROR_CHANGELOG_OPTIONS
  }
});

const funcPropertiesSchema = (isChangeSet) => ({
  properties: {
    func: {
      type: 'function',
    },
    ...commonProperties(isChangeSet)
  },
  additionalProperties: false,
  required: [MC.FUNC]
});

const changeSetRefSchema = (isChangeSet) => ({
  properties: {
    changeid: {
      type: 'string',
    },
    author: {
      type: 'string',
    },
    file: {
      type: 'string',
    },
    ...commonProperties(isChangeSet)
  },
  additionalProperties: false,
  required: [MC.CHANGEID, MC.AUTHOR, MC.FILE]
});


const preConditionsSchema = (isChangeSet) => ({
  id: isChangeSet ? '/ChangeSetPreconditions' : 'ChangeLogPreconditions',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'array',
  items: {
    type: 'object',
    uniqueItems: true,
    oneOf: [funcPropertiesSchema(isChangeSet), changeSetRefSchema(isChangeSet)]
  }
});

export const ChangeLogPreconditions = preConditionsSchema(false);
export const ChangeSetPreconditions = preConditionsSchema(true);
