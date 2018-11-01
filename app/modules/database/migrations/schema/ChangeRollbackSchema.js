import * as MC from '../../../../utils/constants/MigrationsConstants';

export default({
  id: '/ChangeRollbackSchema',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  oneOf: [
    {
      func: {
        type: 'function',
      },
      additionalProperties: false,
      required: [MC.FUNC]
    },
    {
      update: {
        type: 'object',
        properties: {
          table: { type: 'string' },
          field: { type: 'string' },
          value: { type: ['string', 'boolean', 'array', 'object', 'number', 'integer', 'null'] },
          filter: { type: ['object'] }
        },
        additionalProperties: false,
        required: [MC.TABLE, MC.FIELD, MC.VALUE]
      }
    }
  ]
});
