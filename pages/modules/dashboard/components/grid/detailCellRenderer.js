import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { isArray } from 'lodash'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import 'ag-grid-community'
import { getColDef } from './gridHelpers'
import { getExternalLink } from './externalLinkHelper'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import './index.scss'


const DetailCellRenderer = ({ data, node, api, context }) => {
  const rowId = node.id
  const [childGrid, setChildGrid] = useState([])
  const { addPersistentErrorToast } = useToast()
  const excludeAttrs = ['href', '_rowstamp', 'localref']

  useEffect(() => {
    return () => {
      
      api.removeDetailGridInfo(rowId)
    }
  }, [])

  useEffect(() => {
    const childTable = []

    Object.entries(data).forEach(([childKey, childVal]) => {
      if (childVal !== null && isArray(childVal)) {
        let columnDefs = []
        if (childVal.length > 0) {
          columnDefs = Object.entries(childVal[0]).reduce((acc, [key, val], idx) => {
            if (!excludeAttrs.includes(key)) {
              getColDef(key, val, acc)
            }
            return acc
          }, [])
        }
        const child_values = {
          key: childKey,
          data: childVal,
          colDefs: columnDefs
        }
        childTable.push(child_values)
      }
    })
    setChildGrid(childTable)
  }, [data])

  const defaultColDef = {
    flex: 1,
    minWidth: 120
  }

  const onGridReady = params => {
    const gridInfo = {
      id: node.id,
      api: params.api,
      columnApi: params.columnApi
    }

    api.addDetailGridInfo(rowId, gridInfo)
  }

  function cellClickHandler(params) {
    const { data, colDef } = params
    
    if (colDef?.field === 'description') return

    const { appName, qbe } = getExternalLink(
      data,
      colDef,
      context.jsonSchema,
      context.appLinks,
      params?.context?.title,
      true
    )

    try {
      
      const [path] = data.localref.replace('http:', 'https:').split('/oslc/')
      window.open(
        `${path}/ui/maximo.jsp?event=loadapp&value=${appName}&additionalevent=useqbe&additionaleventvalue=${qbe}`,
        '_blank',
        'noopener noreferrer'
      )
    } catch (e) {
      addPersistentErrorToast({
        title: `Error Opening Record`,
        subtitle: `Unable to load open the seelcted record in Maximo`
      })
    }
  }

  return (
    <div>
      {childGrid.map((child, index) => {
        return (
          <div className="child-grid">
            <h4>{child.key}</h4>
            <AgGridReact
              id={`detailGrid+${index}`}
              className="ag-theme-alpine"
              columnDefs={child.colDefs}
              defaultColDef={defaultColDef}
              onCellClicked={cellClickHandler}
              rowData={child.data}
              onGridReady={onGridReady}
              context={{ title: child.key }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default DetailCellRenderer

DetailCellRenderer.propTypes = {
  data: PropTypes.shape({}),
  context: PropTypes.shape({
    jsonSchema: PropTypes.object,
    appLinks: PropTypes.object
  }),
  node: PropTypes.shape({ id: PropTypes.string }),
  api: PropTypes.shape({ removeDetailGridInfo: PropTypes.func, addDetailGridInfo: PropTypes.func })
}
