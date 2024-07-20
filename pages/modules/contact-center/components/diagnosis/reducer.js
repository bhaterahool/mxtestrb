import _ from 'lodash'

export const getLeafNodes = nodes => _.filter(nodes, node => !node.haschildren)

export const getRootNodes = nodes => _.filter(nodes, node => !node.parent)

export const getParent = (nodes, classstructureid) => {
  const node = nodes[classstructureid]

  if (node && node.parent) {
    return nodes[node.parent]
  }
}

export const fieldTypes = {
  NUMERIC: 'numvalue',
  ALN: 'alnvalue',
  TABLE: 'tablevalue'
}
export const getAncestors = nodes => {
  const getAncestor = node => {
    if (node?.parent) {
      return _.flatten([
        {
          classstructureid: node.parent,
          classificationid: _.last(_.split(node?.parentclassificationid, ' \\ '))
        },
        ...getAncestor(nodes[node.parent])
      ])
    }

    return []
  }

  return _.reduce(
    nodes,
    (result, node) => ({
      ...result,
      [node.classstructureid]: {
        ...nodes[node.classstructureid],
        ancestors: _.reverse(getAncestor(node))
      }
    }),
    {}
  )
}

export const getCustomerCheckNodeIndex = ({ nodes, customer }) => {
  const customerNodes = nodes?.filter(
    node =>
      !node.pluspcustomer ||
      node?.pluspcustassoc?.find(pluspcust => pluspcust?.customer === customer)
  )
  return _.keyBy(customerNodes, 'classstructureid')
}

export const getNodesByParent = (nodes, classstructureid, leafs) => {
  const node = nodes[classstructureid]

  if (node) {
    
    
    if (leafs.includes(classstructureid)) {
      return _.pickBy(nodes, n => n.classstructureid === classstructureid)
    }

    return _.pickBy(nodes, n => n.parent === classstructureid)
  }

  return _.pickBy(nodes, n => !n.parent)
}

export const getAttributes = nodes => {
  const attributes = _.flatMap(
    _.filter(nodes, node => _.has(node, 'classspec')),
    'classspec'
  )

  return attributes
}

export const getGuidanceNotes = nodes =>
  _.map(
    _.filter(nodes, node => !!node?.peldiagnosisadvice),
    'peldiagnosisadvice'
  )

export const isValidClassification = nodes => classstructureid =>
  _.some(nodes, node => node.classstructureid === classstructureid)

export const getNodesFromAncestors = (node, nodes) => {
  if (!node) return []

  return _.map(node.ancestors, ({ classstructureid }) => nodes[classstructureid])
}

export const isLeafNode = (state, classstructureid) => state.leafs.includes(classstructureid)

export const getSelectedAttributes = state => {
  const node = state.nodes[state.classstructureid]

  if (!node) return []

  
  const available = getAttributes([node, ...getNodesFromAncestors(node, state.nodes)])

  
  const existing = _.filter(state.attributes, ({ attribute }) =>
    _.some(available, a => a.assetattributeid === attribute.assetattributeid)
  )
  return existing
}

const addOrReplaceAttribute = (attributes, attribute) => {
  const index = _.findIndex(attributes, a => a.assetattrid === attribute.assetattrid)

  if (index === -1) {
    return [
      ...attributes,
      {
        ...attribute,
        [attribute.type]: attribute.value
      }
    ]
  }

  return [
    ...attributes.slice(0, index),
    {
      ...attribute,
      [attribute.type]: attribute.value
    },
    ...attributes.slice(index + 1)
  ]
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_HIERARCHY': {
      const nodes = getAncestors(getCustomerCheckNodeIndex(action.payload))

      return {
        ...state,
        ...action.payload,
        nodes,
        attributes: action.payload.attributes,
        leafs: _.orderBy(_.map(getLeafNodes(nodes), 'classstructureid'), 'classstructureid')
      }
    }

    case 'SELECT_CLASSIFICATION': {
      const { classstructureid, attributes = [] } = action.payload

      return {
        ...state,
        ...action.payload,
        complete: state.leafs.includes(action.payload.classstructureid),
        classstructureid,
        attributes
      }
    }

    case 'SELECT_ATTRIBUTE':
      return {
        ...state,
        attributes: addOrReplaceAttribute(state.attributes || [], action.payload.attribute),
        complete: state.leafs.includes(state.classstructureid)
      }

    default:
      throw new Error(`Unhandled action: ${action.type}`)
  }
}
