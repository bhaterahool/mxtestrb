import React from 'react'
import PropTypes from 'prop-types'

export const AssetSearchResult = ({ asset }) => {
  return (
    <div>
      <h4>{asset?.assetnum}</h4>
      {asset?.description && <p>{asset?.description}</p>}
      {asset?.serialnum && <p>{asset?.serialnum}</p>}
    </div>
  )
}

AssetSearchResult.propTypes = {
  asset: PropTypes.shape({
    assetnum: PropTypes.string,
    description: PropTypes.string,
    serialnum: PropTypes.string
  })
}
