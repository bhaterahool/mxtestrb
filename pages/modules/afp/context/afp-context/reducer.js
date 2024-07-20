import { uniqueId } from 'lodash'
import moment from 'moment'

export const AFP_TYPE = {
  ADD: 'addAfp',
  REMOVE: 'removeAfp',
  UPDATE: 'updateAfp',
  SET_STATUS: 'setAfpStatus'
}

export const actions = {
  addAfp: (payload = {}) => ({
    type: AFP_TYPE.ADD,
    payload
  }),
  removeAfp: id => ({ type: AFP_TYPE.REMOVE, payload: id }),
  updateAfpData: payload => ({ type: AFP_TYPE.UPDATE, payload }),
  setAfpStatus: payload => ({ type: AFP_TYPE.SET_STATUS, payload })
}

function hasDuplicates(afps, afpLabel) {
  const afp = [...afps.values()].find(({ label }) => label === afpLabel)
  const isOpen = afp?.metadata?.isOpen

  
  if (afp && !isOpen) {
    afps.delete(afp.id)
  }

  return isOpen
}

export function reducer(state, { type, payload }) {
  switch (type) {
    case AFP_TYPE.ADD: {
      const { afpnum } = payload
      const id = afpnum ?? uniqueId('new_')
      const label = afpnum
        ? `AFP ${afpnum}`
        : `${id.replace('_', ' ')} (${moment().format('H:mm')})`

      if (state.has(id)) {
        const {
          metadata: { isOpen }
        } = state.get(id)

        if (!isOpen) {
          state.delete(id)
        }
      }

      if (afpnum && hasDuplicates(state, label)) return state

      return new Map([
        ...state,
        [
          id,
          {
            id,
            label,
            data: {
              status: 'DRAFT',
              ...payload
            },
            metadata: {
              isOpen: true,
              isModified: false
            }
          }
        ]
      ])
    }
    case AFP_TYPE.REMOVE: {
      return reducer(state, actions.setAfpStatus({ id: payload, isOpen: false, isModified: false }))
    }
    case AFP_TYPE.UPDATE: {
      const { id } = payload
      if (!state.has(id)) return state

      const { label, data, metadata } = state.get(id)

      state.set(id, {
        ...payload,
        label: payload.label ? `AFP ${payload.label}` : label,
        data: { ...data, ...payload.data },
        metadata: { ...metadata, ...payload.metadata }
      })
      break
    }
    case AFP_TYPE.SET_STATUS: {
      const { id } = payload
      const { metadata, ...afp } = state.get(id)

      state.set(id, {
        ...afp,
        metadata: {
          ...metadata,
          ...payload
        }
      })
      break
    }
    default:
      throw new Error()
  }

  return new Map([...state])
}
