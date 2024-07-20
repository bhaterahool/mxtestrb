import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { Tile } from 'carbon-components-react'
import { api } from '../../../app/api'
import { useGridConfig } from './useGridConfig'
import { getColDef } from './gridHelpers'
import { getExternalLink } from './externalLinkHelper'
import {
  addOsResult,
  getOsResultsByKpiName,
  replaceOsResult,
  useOsResultsProvider
} from '../../OSResultsProvider'
import { useToast } from '../../../../shared/toasts/ToastProvider'

const excludeAttrs = ['href', '_rowstamp']

export const Grid = ({ kpiName, osName, templateName, kpi }) => {
  const { gridRef, gridStyle, defaultColDef, detailCellRenderer } = useGridConfig()
  const [{ osResults }, dispatchOsResults] = useOsResultsProvider()
  const [appLinks, setAppLinks] = useState([])
  const { addPersistentErrorToast } = useToast()

  useEffect(loadAppLinks, [])
  useEffect(loadJsonSchema, [osName])
  useEffect(loadGridData, [kpiName])

  const { data, columnDefs, jsonSchema } = getOsResultsByKpiName(kpiName, osResults) ?? {}

  const onGridReady = useCallback(params => {
    const datasource = {
      getRows: async params => {
        const pgno = params.request.startRow ? params.request.endRow / 40 : 1
        const osResults = await api.get(
          `/pelos/${osName}?savedQuery=KPI:${kpiName}&querytemplate=${templateName}&oslc.pageSize=40&pageno=${pgno}&ignorecollectionref=1&collectioncount=1`
        )
        const objectStructureData = osResults?.data?.member
        const totalCount = osResults?.data?.responseInfo?.totalCount
        const lastRow = params.request.endRow >= totalCount ? totalCount : -1
        
        params.successCallback(objectStructureData, lastRow)
      }
    }
    
    params.api.setServerSideDatasource(datasource)
  }, [])

  if (data?.length === 0) {
    return (
      <main className="pel--main pel--summary pel--kpi">
        <div className="pel--search-no-result">
          <Tile>No results found</Tile>
        </div>
      </main>
    )
  }

  return (
    <main className="pel--main pel--summary pel--kpi">
      <div style={gridStyle} className="ag-theme-alpine">
        {!!columnDefs && (
          <AgGridReact
            ref={gridRef}
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            masterDetail
            detailRowHeight={150}
            detailCellRenderer={detailCellRenderer}
            onGridReady={onGridReady}
            onCellClicked={cellClickHandler}
            rowSelection="multiple"
            rowModelType="serverSide"
            serverSideStoreType="partial"
            serverSideInfiniteScroll
            rowBuffer={0}
            cacheOverflowSize={2}
            maxConcurrentDatasourceRequests={1}
            cacheBlockSize={40}
            maxBlocksInCache={10}
            context={{ jsonSchema, appLinks }}
          />
        )}
      </div>
    </main>
  )

  async function loadJsonSchema() {
    if (osName) {
      const res = await api.get(`/jsonschemas/${osName}`, {
        useCache: true,
        params: { 'oslc.select': '*' }
      })

      return res.data
    }
  }

  async function loadGridData() {
    if (kpiName && templateName) {
      const osResults = await api
        .get(
          `/pelos/${osName}?savedQuery=KPI:${kpiName}&querytemplate=${templateName}&oslc.pageSize=40&pageno=1&ignorecollectionref=1`
        )
        .catch(e => {
          console.error(e)
          addPersistentErrorToast({
            title: `Error Loading Grid`,
            subtitle: `Unable to load ${kpiName ?? ''} Grid Data`
          })
        })

      if (!osResults) return

      const objectStructureData = osResults?.data?.member

      let columnDefs = []
      if (objectStructureData.length > 0) {
        columnDefs = Object.entries(objectStructureData[0]).reduce((acc, [key, val], idx) => {
          if (!excludeAttrs.includes(key)) {
            getColDef(key, val, acc)
          }
          return acc
        }, [])
        columnDefs[0].cellRenderer = 'agGroupCellRenderer'
      }

      const schema = await loadJsonSchema()

      if (data) {
        dispatchOsResults(replaceOsResult(kpiName, objectStructureData, columnDefs, schema))
      } else {
        dispatchOsResults(addOsResult(kpiName, objectStructureData, columnDefs, schema))
      }
    }
  }

  async function loadAppLinks() {
    
    const res = await api
      .get(`/pelos/PELDOMAIN?oslc.select=synonymdomain{*}&oslc.where=domainid="PELMXPDASHAPPS"`, {
        useCache: true
      })
      .catch(e => {
        console.error(e)
        addPersistentErrorToast({
          title: `Error Loading App Links`,
          subtitle: `Unable to load data from the PELMXPDASHAPPS domain in Maximo`
        })
      })

    const { synonymdomain } = res?.data?.member?.[0]

    setAppLinks(
      new Map(
        synonymdomain.map(sd => {
          return [sd.maxvalue, sd.value]
        })
      )
    )
  }

  function cellClickHandler({ data, colDef }) {
    const { appName, qbe } = getExternalLink(data, colDef, jsonSchema, appLinks)

    try {
      
      const [path] = data.href.replace('http:', 'https:').split('/oslc/')
      window.open(
        `${path}/ui/maximo.jsp?event=loadapp&value=${appName}&additionalevent=useqbe&additionaleventvalue=${qbe}`,
        '_blank',
        'noopener noreferrer'
      )
    } catch (e) {
      console.error(e)
      addPersistentErrorToast({
        title: `Error Opening Record`,
        subtitle: `Unable to load open the seelcted record in Maximo`
      })
    }
  }
}

Grid.propTypes = {
  kpiName: PropTypes.string,
  osName: PropTypes.string,
  templateName: PropTypes.string,
  kpi: PropTypes.shape({})
}
