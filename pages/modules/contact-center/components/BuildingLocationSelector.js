import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { SelectSkeleton } from 'carbon-components-react'
import { TreeSelect } from 'antd'
import { api } from '../../app/api'

const getBuildingLocations = locations =>
  _.map(locations, loc => {
    if (loc?.childlocations) {
      return {
        id: loc?.childlocations?.[0]?.location,
        location: loc?.childlocations?.[0]?.location,
        value: loc?.childlocations?.[0]?.location,
        description: loc?.childlocations?.[0]?.description,
        title: `${loc?.childlocations?.[0]?.location} - ${loc?.childlocations[0]?.description}`,
        siteid: loc?.siteid,
        isLeaf: !loc.children,
        pId: loc.parent
      }
    }
  }).filter(a => a !== undefined)

export const BuildingLocationSelector = ({
  labelText,
  building,
  onSelectedItemChange,
  location,
  description,
  disabled
}) => {
  const [items, setItems] = useState([])

  const [showLoader, setShowLoader] = useState(true)

  const defaultTitle = description ? `${location} - ${description}` : location
  const [treeValue, setTreeValue] = useState(defaultTitle)

  useEffect(() => {
    if (disabled) {
      setTreeValue(description ? `${location} - ${description}` : location)
      setShowLoader(false)
      return
    }

        if (items.length) {
      setTreeValue('')
    }
    setShowLoader(true)
    api
      .get(
        `/pelos/pellocchild?oslc.where=location="${building}"&oslc.select=*,lochierarchy{*,rel.childlocations{location,description}}&querytemplate=BASIC_SEARCH&savedQuery=OPERATING&lochierarchy.childlocations.where=status="OPERATING"`
      )
      .then(res => {
        const parentLocation = [
          {
            id: building,
            location: building,
            value: building,
            description,
            title: `${building} - ${description}`,
            siteid: undefined,
            isLeaf: false,
            pId: '1'
          }
        ]
        const d = res.data.member ? getBuildingLocations(res.data.member[0].lochierarchy) : []
        setItems(d ? [...parentLocation, ...d] : [])
        setTreeValue(description ? `${location} - ${description}` : location)
        setShowLoader(res.data.member?.[0]?.lochierarchy)
      })
      .catch(error => {
        throw new Error(`Cound not retrieve child locations reason: ${error.message}`)
      })
  }, [building])

  if (showLoader && !items.length) return <SelectSkeleton />

    const onChange = e => {
    const selectedItem = items.find(item => item.location === e)
    setTreeValue(selectedItem.title)
    return onSelectedItemChange({ selectedItem })
  }

  const onLoadData = async treeNode => {
    return disabled
      ? Promise.resolve()
      : new Promise(resolve => {
          api
            .get(
              `/pelos/pellocchild?oslc.where=location="${treeNode.value}"&oslc.select=*,lochierarchy{*,rel.childlocations{location,description}}&querytemplate=BASIC_SEARCH&savedQuery=OPERATING&lochierarchy.childlocations.where=status="OPERATING"`
            )
            .then(res => {
              const d =
                res?.data?.member?.length > 0
                  ? getBuildingLocations(res?.data?.member?.[0]?.lochierarchy)
                  : []
              setItems([...items, ...d])
              resolve()
            })
            .catch(error => {
              throw new Error(`Cound not retrieve child locations reason: ${error.message}`)
            })
        })
  }
  return (
    <div className="custom-ant-design bx--form-item">
      <label className="bx--label" htmlFor="pellocbuilding">
        {labelText}
      </label>
      <TreeSelect
        treeDataSimpleMode
        virtual={false}
        style={{ width: '100%' }}
        value={treeValue}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        dropdownClassName="custom-ant-dropdown"
        placeholder="Select a Location"
        onChange={onChange}
        loadData={onLoadData}
        treeData={_.uniqBy(items, 'id')}
        disabled={disabled}
      />
    </div>
  )
}

BuildingLocationSelector.propTypes = {
  location: PropTypes.string,
  onSelectedItemChange: PropTypes.func.isRequired,
  labelText: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  building: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired
}
