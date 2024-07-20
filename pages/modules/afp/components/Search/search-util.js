import axios from 'axios'
import { api } from '../../../app/api'
import config from '../../../app/config'
import { mockSearchResults } from './mockSearchResults'
import { STATUS as GRID_STATUS } from '../AfpLinesGrid/gridDefinition'

export const SEARCH_TYPE = {
  BASIC: 1,
  ADVANCED: 2,
  AFP: 3
}
export const DEFAULT_FILTER = { value: 'ALL', description: 'No Filter' }
export const FILTERS = [
  { value: 'DEFAULT', description: 'Open AFPs' },
  { value: 'POONLY', description: 'Default only PO type' },
  { value: 'MFAONLY', description: 'Default only MFA type' },
  { value: 'NEWONLY', description: ' New AFPs' },
  { value: 'APPRONLY', description: ' Approved AFPs' },
  { value: 'QRYONLY', description: 'Queried AFPs' },
  { value: 'SUBONLY', description: ' Submitted AFPs' },
  DEFAULT_FILTER
]
const options = config.search
const objectType = 'pelsubafp'

export const getMockSearchResults = () => new Promise(resolve => resolve(mockSearchResults))

export const getSearchResults = ({ searchParams = {}, cancelToken }) => {
  const { searchTerm = '', where = undefined, savedQuery } = searchParams.queryParams
  return api.get(`/pelos/pelsubafp?_dropnulls=0&lean=1`, {
    params: {
      querytemplate: options[objectType]?.searchQueryTemplate,
      savedQuery: savedQuery ?? options[objectType]?.savedQuery,
      pageno: searchParams.pageno,
      'oslc.searchTerms': `*${searchTerm}*`,
      'oslc.select': '*,pelafpline{*,rel.pelpoline{linecost}}',
      'oslc.where': where
    },
    cancelToken
  })
}

export const defaultSearchParams = {
  queryParams: {
    searchTerms: '',
    pageno: 1
  }
}

export const calcTotalValue = afpline =>
  afpline
    ? afpline.reduce(
        (acc, { linecost, status }) => (status !== GRID_STATUS.HOLD ? acc + Number(linecost) : acc),
        0
      )
    : 0

export const doSearch = async ({
  ref,
  searchParams,
  setSearchResponse,
  setSearchLoading,
  setSearchError
}) => {
  if (ref.current) {
    setSearchResponse([])
    setSearchLoading(false)
    ref.current.cancel()
  }
    ref.current = axios.CancelToken.source()

  try {
    setSearchError(null)
    setSearchLoading(true)
    const {
      data: { member }
    } = await getSearchResults({ searchParams, cancelToken: ref.current.token })
    const afps = member.map(afp => ({ ...afp, totalappvalue: calcTotalValue(afp.pelafpline) }))
    setSearchResponse(afps)
    setSearchLoading(false)
  } catch (err) {
    if (!axios.isCancel(err)) {
      setSearchResponse([])
      setSearchLoading(false)
      setSearchError(err?.message)
    }
  }
}
