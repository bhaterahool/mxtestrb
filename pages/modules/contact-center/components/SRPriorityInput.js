import React, { useCallback, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Select, SelectItem } from 'carbon-components-react'
import _ from 'lodash'
import { api } from '../../app/api'
import { useToast } from '../../../shared/toasts/ToastProvider'
import { checkSRtypeCondition } from '../../../util/checkSRtypeCondition'
import { PelTextInput } from '../../../shared/forms'

export const SRPriorityInput = ({
  internalpriority,
  location,
  classstructureid,
  classstructureidOld,
  ticketspec,
  handleChange,
  priorityTypes,
  assetnum,
  siteid,
  isLeafNodeSelected,
  isBranchSelected,
  pelsrtype,
  srTypesCondition,
  readOnly,
  pluspcustomer,
  skipprioritycalculation
}) => {
  const { addSuccessToast, addPersistentErrorToast } = useToast()

  
  const isFirstRun = useRef(true)

  const setPriority = useCallback(
    _.debounce(async params => {
      try {
        const res = await api.post(
          '/pelos/PELSRFULL?lean=1&action=wsmethod:returnPriority',
          _.pickBy({
            ...params,
            ticketspec: params?.ticketspec
          })
        )

        
        handleChange(res.data?.internalpriority)

        
        localStorage.setItem('calculatedInternalPriority', res.data?.internalpriority)

        
        if (res.data?.internalpriority === params.internalpriority) {
          return
        }

        addSuccessToast({
          title: 'Priority Updated',
          subtitle: `Priority set to ${res.data?.internalpriority}`
        })
      } catch (err) {
        addPersistentErrorToast({
          subtitle: 'Failed to get Priority data',
          caption: err.message
        })
      }
    }, 1000),
    []
  )

  
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    

    if (
      location &&
      classstructureid &&
      checkSRtypeCondition(pelsrtype, srTypesCondition, isLeafNodeSelected, isBranchSelected) &&
      !skipprioritycalculation &&
      classstructureidOld !== classstructureid
    ) {
      setPriority({
        location,
        classstructureid,
        assetnum,
        ticketspec,
        siteid,
        internalpriority,
        pluspcustomer,
        pelsrtype
      })
    }
  }, [location, classstructureid, assetnum, ticketspec, pluspcustomer, pelsrtype])

  if (readOnly) {
    const priority =
      priorityTypes.find(pt => pt.value === internalpriority)?.description ?? internalpriority
    return (
      <PelTextInput
        id="priority-readonly"
        name="priority-readonly"
        labelText="Work Priority"
        value={priority}
        readOnly
        light
      />
    )
  }

  const priorityChange = e => {
    handleChange(e.target.value)
  }

  return (
    <Select
      id="internalpriority"
      name="internalpriority"
      labelText="Work Priority"
      onChange={priorityChange}
      value={internalpriority}
    >
      <SelectItem text="Select Priority" />
      {_.map(priorityTypes, unit => (
        <SelectItem text={unit.description} value={unit.value} key={unit.valueid} />
      ))}
    </Select>
  )
}

SRPriorityInput.propTypes = {
  internalpriority: PropTypes.any,
  classstructureid: PropTypes.string,
  classstructureidOld: PropTypes.string,
  siteid: PropTypes.string,
  assetnum: PropTypes.string,
  location: PropTypes.string,
  ticketspec: PropTypes.arrayOf(
    PropTypes.shape({
      assetattrid: PropTypes.string,
      tablevalue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
    })
  ),
  handleChange: PropTypes.func,
  priorityTypes: PropTypes.arrayOf(
    PropTypes.shape({
      valueid: PropTypes.string,
      value: PropTypes.number,
      description: PropTypes.string
    })
  ),
  isLeafNodeSelected: PropTypes.bool,
  isBranchSelected: PropTypes.bool,
  srTypesCondition: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      alnvalue: PropTypes.string,
      srtype: PropTypes.string
    })
  ),
  pelsrtype: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  skipprioritycalculation: PropTypes.bool,
  pluspcustomer: PropTypes.string
}
