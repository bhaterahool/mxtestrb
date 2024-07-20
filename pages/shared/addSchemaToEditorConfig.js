import _ from 'lodash'

export const addSchemaToEditorConfig = (schema, editorConfig) => {
  
  for (const [field, value] of editorConfig.entries()) {
    const schemaPath = field.split('[0].').join('.items.properties.')
    const fieldSchema = _.get(schema.properties, schemaPath)
    if (fieldSchema) {
      editorConfig.set(field, {
        ...value,
        labelText: fieldSchema.title,
        remarks: fieldSchema.remarks,
        maxLength: fieldSchema.maxLength
      })
    }
  }
}
