import { api } from '../../app/api'
import { getAfterPost } from '../components/AfpForm/mock_create_new_afp'
import { trimHref } from '../utilities/urlHelpers'
import { isEmpty } from '../../../util'
import { log } from '../../../dev.config'

export const getAfpData = (afpnum, onErr) =>
  api
    .get('/pelos/pelsubafp', {
      params: {
        lean: 1,
        'oslc.select': '*,pelafpline{*,rel.pelpoline{linecost}}', 
        'oslc.where': `afpnum="${afpnum}"`
      }
    })
    .then(({ data: { member } }) => {
      const [response] = member
      return response
    })
    .catch(({ message }) => {
      onErr({
        subtitle: 'Error loading AFP data',
        caption: message
      })
    })

export const getAfps = (afpNums, cancelToken) =>
  api
    .get('/pelos/pelsubafp', {
      params: {
        lean: 1,
        'oslc.select': 'afpnum',
        'oslc.where': `afpnum in [${afpNums.join(',')}]`
      },
      cancelToken
    })
    .then(({ data: { member } }) => member)
    .catch(({ message = '' }) => {
      log(message)
    })

export const getList = async (listType, { select = '*' }) => {
  const {
    data: { member }
  } = await api.get(`/pelos/pelsubafp/zombie/getlist~${listType}`, {
    params: {
      lean: 1,
      'oslc.select': select
    },
    useCache: true
  })
  return member
}

export const getMfaRefList = async busUnit => {
  const {
    data: { member }
  } = await api.get(`/pelos/pelsubafppurch`, {
    params: {
      lean: 1,
      'oslc.select': 'contractnum,description,pelbusunit,revisionnum',
      'oslc.where': `pelbusunit="${busUnit}"`,
      savedQuery: 'PELAFPMFAREFS'
    },
    useCache: true
  })
  return member
}

export const genAfpLines = url =>
  api.post(url, null, {
    headers: {
      properties: '*',
      'x-method-override': 'PATCH'
    },
    params: {
      lean: 1,
      action: 'wsmethod:PELGENAFPLINES',
      interactive: 0
    }
  })

export const createAfpMockSuccess = (payload, onErr, onSuccess) => {
  onSuccess({
    subtitle: `AFP TEST created successfully`
  })
  const dataWithAfplines = getAfterPost?.member[0]
  return dataWithAfplines
}

export const createAfp = (payload, onErr, onSuccess) =>
  api
    .post('/pelos/pelsubafp', payload, {
      headers: {
        properties: 'afpnum,pelafpid,statusdate,orgid,changedate,changeby'
      },
      params: {
        interactive: 0
      }
    })
    .then(async ({ data }) => {
      const response = await genAfpLines(trimHref(data.href)).catch(({ message }) => {
        onErr({
          subtitle: 'Error adding AFP lines',
          caption: message
        })
        return false
      })
      let dataWithAfplines = { pelafpline: [] }
      if (response?.status === 200) {
        dataWithAfplines = await getAfpData(data.afpnum, onErr)
      }
      onSuccess({
        subtitle: `AFP ${data.afpnum} created successfully`
      })
      return dataWithAfplines?.pelafpline?.length ? dataWithAfplines : data
    })
    .catch(({ message }) => {
      onErr({
        subtitle: 'Error creating AFP data',
        caption: message
      })
      return false
    })

export const addAfpLineDetail = (href, payload = {}, delay = 0) =>
  api
    .post(trimHref(href), [payload], {
      headers: {
        'x-method-override': 'PATCH',
        patchtype: 'MERGE'
      },
      params: {
        interactive: 0
      }
    })
    .then(() => {
      setTimeout(() => {}, delay)
    })

export const deleteAfpLineDetail = href => api.delete(href)

export const deleteAfpLines = (href, payload, onErr, onSuccess) =>
  api
    .post(trimHref(href), payload, {
      headers: {
        'x-method-override': 'PATCH',
        properties: '*',
        patchtype: 'MERGE'
      },
      params: {
        interactive: 0
      }
    })
    .then(({ data }) => {
      onSuccess({
        subtitle: 'AFP Lines deleted successfully'
      })
      return data
    })
    .catch(({ message }) => {
      onErr({
        subtitle: 'Error deleting AFP lines data',
        caption: message
      })
      return false
    })

export const saveAfpData = (href, payload, onErr, onSuccess) =>
  api
    .post(trimHref(href), payload, {
      headers: {
        'x-method-override': 'PATCH',
        properties: '*,pelafpline{*,rel.pelpoline{linecost}}'
      },
      params: {
        interactive: 0
      }
    })
    .then(({ data }) => {
      onSuccess({
        subtitle: 'AFP saved successfully'
      })
      return data
    })
    .catch(({ message }) => {
      onErr({
        subtitle: 'Error updating AFP data',
        caption: message
      })
      return false
    })

export const getContractLineIdList = async ({ pelmfarevisonnum, pelmfaref }) => {
  try {
    const response = await api.get(`pelos/PELCONTRACTLINE`, {
      params: {
        lean: 1,
        'oslc.select':
          'contractnum,revisionnum,contractlineid, contractlinenum,description,remark, enterdate, chgqtyonuse, chgpriceonuse, orderunit,unitcost,orderqty, linecost',
        'oslc.where': `contractnum="${pelmfaref}" and revisionnum=${pelmfarevisonnum}`
      }
    })

    return {
      ok: true,
      result: {
        data: response?.data?.member || [],
        params: { pelmfarevisonnum, pelmfaref }
      }
    }
  } catch ({ message }) {
    return {
      ok: false,
      error: message
    }
  }
}

export const getAfpLinesContracts = async (type, pelAfpLines, setLoadingStatus = () => {}) => {
  if (type === 'SUBAFP' && !isEmpty(pelAfpLines)) {
    const acc = pelAfpLines?.reduce((acc, current) => {
      const isExist = acc?.some(
        row =>
          row?.pelmfarevisonnum === current?.pelmfarevisonnum &&
          row?.pelmfaref === current?.pelmfaref
      )
      if (!isExist && current?.pelmfaref) {
        acc.push({
          pelmfaref: current?.pelmfaref,
          pelmfarevisonnum: current?.pelmfarevisonnum || 0
        })
      }
      return acc
    }, [])

    if (acc?.length) {
      const requests = acc?.map(({ pelmfaref, pelmfarevisonnum }) =>
        getContractLineIdList({
          pelmfarevisonnum,
          pelmfaref
        })
      )

      setLoadingStatus(true)

      const responses = await Promise.all(requests)

      setLoadingStatus(false)

      const { results } = responses?.reduce(
        (acc, current) => {
          if (current.ok) {
            acc.results.push(current)
          } else {
            acc.errors.push(current)
          }
          return acc
        },
        {
          results: [],
          errors: []
        }
      )

      if (!isEmpty(results)) {
        const pelAfpLinesWithContracts = pelAfpLines.map(row => ({
          ...row,
          pelContractLines:
            results?.find(
              ({ result: { params } }) =>
                params.pelmfarevisonnum === row.pelmfarevisonnum &&
                params.pelmfaref === row.pelmfaref
            )?.result?.data ?? []
        }))

        return {
          isUpdated: true,
          pelAfpLines: pelAfpLinesWithContracts
        }
      }
    }
  }
  
  return { isUpdated: false, pelAfpLines }
}

export const deleteAfpData = (href, payload, onErr, onSuccess) =>
  api
    .post(trimHref(href), payload, {
      headers: {
        'x-method-override': 'DELETE',
        properties: '*,pelafpline{*,rel.pelpoline{linecost}}'
      },
      params: {
        interactive: 0
      }
    })
    .then(({ data }) => {
      onSuccess({
        subtitle: 'AFP deleted successfully'
      })
      return data
    })
    .catch(({ message }) => {
      onErr({
        subtitle: 'Error updating AFP data',
        caption: message
      })
      return false
    })
