import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ClickableTile, CodeSnippetSkeleton } from 'carbon-components-react'
import _ from 'lodash'
import CountUp from 'react-countup'
import { useRegistry } from '../../../../shared/RegistryProvider'
import { useSubcontractSearchProvider } from '../../search/SubcontractSearchProvider'
import { api } from '../../../app/api'
import { namespace } from '../../../../util/namespace'

export const Summary = ({ isOpen, refreshSummary, handleSummaryRefresh }) => {
  const { searchParams, setSearchParams } = useSubcontractSearchProvider()

  const [{ pelassignmentQueries }] = useRegistry()

  const [filteredQueries, setFilteredQueries] = useState()

  
  const getSuffix = _.partial((queries, clausename, noSearchTerms) => {
    const query = queries?.find(query => clausename === query.clausename)

    if (!query) {
      throw new Error(`could not find suffix for ${clausename}`)
    }

    if (noSearchTerms && query.peltssuffix.startsWith('AND')) {
      return query.peltssuffix.substring(4)
    }

    return query.peltssuffix
  }, pelassignmentQueries)

  const getAllQueryCounts = async queries => {
    queries.forEach((query, i) => {
      
      query.loading = true
      const searchtext = ''
      const queryParams = {
        ...searchParams?.queryParams,
        ...(!searchtext && {
          where: `pelsearchterms="${getSuffix(query?.clausename ?? 'DEFAULT', true)}"`
        })
      }

      api
        .get(`/pelos/pelassignment`, {
          params: {
            count: 1,
            savedQuery: query?.clausename,
            ...namespace('oslc', {
              ...queryParams
            })
          }
        })
        .then(res => {
          setFilteredQueries(queries => {
            const updatedQueries = [...queries]
            updatedQueries[i].totalCount = res?.data?.totalCount || 0
            updatedQueries[i].loading = false
            return updatedQueries
          })
        })
    })
  }

  useEffect(() => {
    if (refreshSummary) {
      //      setAssignmentidWithCount(filteredPelAssignmentQueries)
      getAllQueryCounts(filteredQueries)
      handleSummaryRefresh(false)
    }
  }, [refreshSummary])

  useEffect(() => {
    if (pelassignmentQueries) {
      const filteredPelAssignmentQueries = pelassignmentQueries
        ?.map(query => ({ ...query, loading: true }))
        .filter(pelassignmentQuery => pelassignmentQuery?.pelmxpinsummary)
        .sort((a, b) => a?.pelmxpdispseq - b?.pelmxpdispseq)

      setFilteredQueries(filteredPelAssignmentQueries)

      if (filteredPelAssignmentQueries?.length) {
        getAllQueryCounts(filteredPelAssignmentQueries)
      }
    }
  }, [pelassignmentQueries])

  const onClickSummary = pelassignmentQuery => e => {
    e.preventDefault()
    const searchtext = ''
    const queryParams = {
      ...searchParams?.queryParams,
      savedQuery: pelassignmentQuery?.clausename,
      ...(!searchtext && {
        where: `pelsearchterms="${getSuffix(
          pelassignmentQuery ? pelassignmentQuery?.clausename : 'DEFAULT',
          true
        )}"`
      })
    }

    setSearchParams(params => ({ ...params, queryParams, skipSaveHistory: !searchtext }))
  }

  return (
    <>
      <main className={`pel--main pel--summary ${isOpen ? '' : 'pel--searchlist-toggle'}`}>
        <div className="pel--summary--scroll--view">
          <div className="bx--row">
            {filteredQueries?.map(query => {
              return (
                <div className="pel--summary-card" key={`skel-${query.description}`}>
                  <ClickableTile
                    handleClick={onClickSummary(query)}
                    className="card card-1 clickable-kpi"
                    href="#"
                    key={`pel-summary-${query.description}`}
                  >
                    <div className="bx--card-header">
                      <h4>{query.description}</h4>
                    </div>
                    <div className="bx--card__card-overview">
                      <div className="content top-content">
                        {query.loading ? (
                          <CodeSnippetSkeleton type="multi" />
                        ) : (
                          <p>
                            <CountUp separator="," end={query.totalCount} duration="1" />
                          </p>
                        )}
                      </div>
                    </div>
                  </ClickableTile>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}

Summary.propTypes = {
  isOpen: PropTypes.bool,
  refreshSummary: PropTypes.bool,
  handleSummaryRefresh: PropTypes.func
}
