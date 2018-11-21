import * as MC from '../../../../utils/constants/MigrationsConstants';

export default({
  id: '/ChangeRollbackSchema',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  oneOf: [
    {
      id: '/FuncSchema',
      $schema: 'http://json-schema.org/draft-04/schema#',
      properties: {
        func: {
          type: 'function',
        },
      },
      additionalProperties: false,
      required: [MC.FUNC]
    },
    {
      id: '/UpdateSchema',
      $schema: 'http://json-schema.org/draft-04/schema#',
      properties: {
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
      },
      additionalProperties: false,
      required: [MC.UPDATE]
    }
  ]
});
