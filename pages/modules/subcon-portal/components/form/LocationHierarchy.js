import React, { useEffect, useState } from 'react'
import { Tree } from 'antd'
import PropTypes from 'prop-types'
import { HomeOutlined, ArrowRightOutlined, LineOutlined } from '@ant-design/icons'
import { api } from '../../../app/api'
import './scss/location.scss'

const getTree = (parentid, data, stopAtLocation) => {
  const parent = data.find(locancestor => locancestor.locations[0].parent === parentid)
  const [loc] = parent.locations
  const location = {
    id: loc.location,
    parent: loc.parent,
    title: `${loc.location} - ${loc.description}`
  }
  if (location.id !== stopAtLocation) {
    location.icon = <ArrowRightOutlined />
    location.children = getTree(location.id, data, stopAtLocation)
  } else {
    location.icon = <LineOutlined />
  }
  return [location]
}

export const LocationHierarchy = ({ location }) => {
  const [treeData, setTreeData] = useState([])
  useEffect(async () => {
    setTreeData([])
    const response = await api
      .get(`/pelos/pellocfull`, {
        params: {
          lean: 1,
          'oslc.select': `*,locancestor{*,rel.locations{parent,type,description,location}}`,
          'oslc.where': `location=${location}`
        }
      })
      .catch(e => console.log(e.message))

    if (response) {
      const locationData = response.data?.member?.[0]?.locancestor
      const [building] = locationData.find(
        locancestor => locancestor?.locations?.[0]?.type === `BUILDING`
      )?.locations

      const treeData = [
        {
          id: building.location,
          title: `${building.location} - ${building.description}`,
          children:
            building.location !== location
              ? getTree(building.location, locationData, location)
              : [],
          icon: <HomeOutlined />
        }
      ]

      setTreeData(treeData)
    }
  }, [location])

  if (treeData.length === 0) return null

  return (
    <div className="bx--form-item overflow-auto">
      <label htmlFor="location-hierarchy-tree" className="bx--label">
        Location
      </label>
      <Tree
        id="location-hierarchy-tree"
        selectable={false}
        showIcon
        defaultExpandAll
        switcherIcon={React.Fragment}
        treeData={treeData}
      />
    </div>
  )
}

LocationHierarchy.propTypes = {
  location: PropTypes.string
}
