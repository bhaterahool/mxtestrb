import { decodeMxResourceId } from '../../utils/decodeMxResourceId'

export const getExternalLink = (data, colDef, jsonSchema, appLinks, title, childkey) => {
  let appName
  let qbe
  let pks

  const splitField = colDef.field.split('.')

  if (splitField.length > 1) {
    const [parentObjectName] = splitField
    const childDataObject = data[parentObjectName]
    

    const childSchema = jsonSchema?.properties?.[parentObjectName]

    

    const pks = childSchema?.items?.pk

    
    appName = appLinks.get(childSchema?.items.title.split('/').pop())

    
    qbe = pks
      .reduce((acc, cur, idx) => {
        if (childDataObject[cur]) {
          return [...acc, `${cur}=${childDataObject[cur]}`]
        }

        return acc
      }, [])
      .join('|')
  } else {
    
    const resourceId = childkey ? data.href.split('childkey').pop() : data.href.split('/').pop()

    
    let decodedId = decodeMxResourceId(resourceId)
    if (childkey) {
      decodedId = decodedId.replace(`${jsonSchema?.properties[title].items.title}/`, '')
    }
    // split decoded resourceid into object and primary key values
    const pValues = decodedId.split('/')

    if (childkey) {
      pks = jsonSchema?.properties[title].items.pk?.sort()
      appName = appLinks.get(title.toUpperCase())
    } else {
      appName = appLinks.get(jsonSchema?.title)
      pks = jsonSchema?.pk?.sort()
    }

    // create qbe where clause from primary keys-values
    qbe = pks
      .reduce((acc, cur, idx) => {
        if (pValues[idx]) {
          return [...acc, `${cur}=${pValues[idx]}`]
        }
        return acc
      }, [])
      .join('|')
  }

  return { appName, qbe }
}
