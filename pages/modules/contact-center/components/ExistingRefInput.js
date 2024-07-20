import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'carbon-components-react'
import Launch16 from '@carbon/icons-react/lib/launch/16'
import moment from 'moment'
import { useDrop } from 'react-dnd'
import { SearchResultItem } from '../search/components/SearchResultItem'
import { TypeAhead } from '../search/containers/TypeAhead'
import { api } from '../../app/api'
import { useToast } from '../../../shared/toasts/ToastProvider'

export const getDerivedType = (sr, pluspagreement, actualfinish, statusTypes) => {
  if (!sr) return 'RW'

  
  if (
    statusTypes.some(
      status => status.value === sr.status && ['INPROG', 'NEW'].includes(status.maxvalue)
    )
  ) {
    return 'CH'
  }

  if (pluspagreement && actualfinish) {
    const finish = moment(actualfinish, moment.ISO_8601)

    
    if (finish.isAfter(moment().subtract(pluspagreement.pelrecallperiod, 'hours'))) {
      return 'RC'
    }
  }

  
  return 'RW'
}

export const ExistingRefInput = ({
  onSelectedItemChange,
  selectedItem,
  pluspcustomer,
  loading,
  hidden,
  handleSelectTicket,
  statusTypes,
  ...props
}) => {
  const [isLoading, setLoading] = useState(loading)
  const { addErrorToast } = useToast()

  useEffect(() => {
    setLoading(loading)
  }, [loading])

  const handleChange = async changes => {
    if (!changes.selectedItem) return onSelectedItemChange('')

    setLoading(true)

    try {
      // Get PELSRFULL.
      const { data } = await api.get(
        `/pelos/PELSRFULL?oslc.select=pelsrtype,pluspagreement{*},tkserviceaddress{pelsabusunit{*}},asset,pluspcustponum,relatedrecord,pellocpclookup,actualfinish,ticketspec{*},classstructure{description_class,classstructureid}&oslc.where=ticketid="${changes.selectedItem.ticketid}"`
      )

      const {
        asset,
        pellocpclookup,
        pluspagreement,
        actualfinish,
        pluspcustponum,
        ticketspec,
        classstructure,
        pelsrtype
      } = data.member[0]

      if (['CH', 'IN'].includes(pelsrtype)) {
        addErrorToast({
          autohide: false,
          subtitle: 'Invalid Existing SR Ref',
          caption:
            'The chosen SR reference relates to either an information or chase service request, which is invalid. Please choose the correct originating SR.'
        })
      }

      setLoading(false)

      return onSelectedItemChange({
        selectedItem: {
          ...changes.selectedItem,
          pellocpclookup,
          pelsrtype: getDerivedType(
            changes.selectedItem,
            pluspagreement?.[0],
            actualfinish,
            statusTypes
          ),
          pluspcustponum,
          asset,
          ticketspec,
          classstructure
        }
      })
    } catch (err) {
      
      setLoading(false)
    }
  }

  const [, drop] = useDrop({
    accept: 'sr',
    drop: item => {
      if (item?.ticketid) {
        handleChange({ selectedItem: item })
      }
    }
  })

  return (
    <div className="pel--input-utility pel--truncate" ref={drop}>
      <TypeAhead
        {...props}
        hidden={hidden}
        objectType="pelsrlite"
        selectedItemsOnly
        searchTicketId
        searchResult={item => <SearchResultItem {...item} />}
        selectedItem={selectedItem}
        itemToString={item => item?.ticketid || ''}
        onSelectedItemChange={handleChange}
        showSkeleton={isLoading}
        showDescription
        queryParams={{
          ...(pluspcustomer && {
            where: `pluspcustomer="${pluspcustomer[0].customer}"`
          })
        }}
      />
      {!hidden && !isLoading && selectedItem.ticketid && (
        <Button
          disabled={!selectedItem.ticketid}
          key="opensr"
          renderIcon={Launch16}
          kind="tertiary"
          iconDescription="Open SR"
          tooltipPosition="top"
          hasIconOnly
          size="small"
          className="pel--control-right"
          onClick={() =>
            handleSelectTicket(selectedItem.ticketid, { pelsrtype: selectedItem?.pelsrtype })
          }
        />
      )}
    </div>
  )
}

ExistingRefInput.propTypes = {
  hidden: PropTypes.bool.isRequired,
  handleSelectTicket: PropTypes.func,
  onSelectedItemChange: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    ticketid: PropTypes.string.isRequired,
    pelsrtype: PropTypes.string
  }),
  pluspcustomer: PropTypes.any,
  loading: PropTypes.bool.isRequired,
  statusTypes: PropTypes.arrayOf(
    PropTypes.shape({
      maxvalue: PropTypes.string,
      value: PropTypes.string,
      description: PropTypes.string
    })
  )
}
