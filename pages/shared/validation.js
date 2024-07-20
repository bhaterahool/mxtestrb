import Ajv from 'ajv'
import meta from 'ajv/lib/refs/json-schema-draft-06.json'

const ajv = new Ajv()
ajv.addMetaSchema(meta);

export const resolver = schema =>
  (data, context) => {
    const valid = ajv.validate(schema, data)

    console.log(data, context, ajv.errors)
    return {
      values: ajv.errors ? {} : values,
      errors: error
        ? error.details.reduce((previous, currentError) => {
            return {
              ...previous,
              [currentError.path[0]]: currentError
            };
          }, {})
        : {}
    };
  }
