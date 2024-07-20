import _ from 'lodash'
import { reducer, getNodesByParent, getNodeIndex, getAncestors } from '../reducer'
import hierarchy from './__fixtures__/hierarchy.json'

describe('diagnosis reducer', () => {
  it('should load raw hierarchy into state', () => {
    const result = reducer(
      {
        nodes: []
      },
      {
        type: 'LOAD_HIERARCHY',
        payload: {
          nodes: [
            {
              classstructureid: '12345',
              description: 'Test Classification 1',
              haschildren: true,
              parent: ''
            },
            {
              classstructureid: '11111',
              description: 'Test Classification 3',
              haschildren: true,
              parent: '12345'
            },
            {
              classstructureid: '67890',
              description: 'Test Classification 2',
              haschildren: false,
              parent: '11111'
            }
          ]
        }
      }
    )

    expect(result.nodes).toEqual({
      '12345': {
        classstructureid: '12345',
        description: 'Test Classification 1',
        haschildren: true,
        parent: '',
        ancestors: []
      },
      '67890': {
        classstructureid: '67890',
        description: 'Test Classification 2',
        haschildren: false,
        parent: '11111',
        ancestors: [
          { classstructureid: '11111', classificationid: '' },
          { classstructureid: '12345', classificationid: '' }
        ]
      },
      '11111': {
        classstructureid: '11111',
        description: 'Test Classification 3',
        haschildren: true,
        parent: '12345',
        ancestors: [{ classstructureid: '12345', classificationid: '' }]
      }
    })
  })

  it('should index all leaf nodes in hierarchy', () => {
    const result = reducer(
      {
        nodes: [],
        leafs: []
      },
      {
        type: 'LOAD_HIERARCHY',
        payload: {
          nodes: [
            { classstructureid: '12345', description: 'Test Classification 1', haschildren: false },
            { classstructureid: '67890', description: 'Test Classification 2', haschildren: true },
            { classstructureid: '11111', description: 'Test Classification 3', haschildren: false },
            { classstructureid: '22222', description: 'Test Classification 4', haschildren: true }
          ]
        }
      }
    )

    expect(result.leafs).toEqual(['11111', '12345'])
  })

  it('should properly load ancestors against fixtures', () => {
    const result = reducer(
      {
        nodes: []
      },
      {
        type: 'LOAD_HIERARCHY',
        payload: {
          nodes: hierarchy
        }
      }
    )

    expect(result.nodes['7996'].ancestors).toEqual([
      { classificationid: 'AIR', classstructureid: '7980' },
      { classificationid: 'HAC', classstructureid: '7979' }
    ])
  })

  it('should set as complete when selecting a leaf node', () => {
    const result = reducer(
      {
        nodes: [
          { classstructureid: '12345', description: 'Test Classification 1', haschildren: false },
          { classstructureid: '67890', description: 'Test Classification 2', haschildren: true },
          { classstructureid: '11111', description: 'Test Classification 3', haschildren: false },
          { classstructureid: '22222', description: 'Test Classification 4', haschildren: true }
        ],
        leafs: ['11111', '12345'],
        complete: false
      },
      {
        type: 'SELECT_CLASSIFICATION',
        payload: { classstructureid: '12345' }
      }
    )

    expect(result.complete).toBe(true)
  })
})

describe('getBranchNodes', () => {
  it('should display all nodes for a selected parent ', () => {
    const nodes = getAncestors(getNodeIndex(hierarchy))

    const expectedNodes = _.pickBy(nodes, node => node.parent === '7980')

    expect(getNodesByParent(nodes, '7980', [])).toEqual(expectedNodes)
  })
})