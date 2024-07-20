import React from 'react'
import PropTypes from 'prop-types'
import { Select } from 'antd'

export const CustomAutoComplete = ({
  value,
  options,
  placeholder = '',
  onSelect = () => {},
  onSearch = () => {},
  onChange = () => {},
  onFocus = () => {},
  onBlur = () => {},
  size = 'large',
  defaultOpen = true
}) => {
  return (
    <Select
      showSearch
      autoFocus
      size={size}
      showArrow={false}
      value={value}
      defaultOpen={defaultOpen}
      options={options}
      style={{ width: '100%' }}
      optionFilterProp="children"
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onSearch={onSearch}
      onSelect={onSelect}
      placeholder={placeholder}
      notFoundContent={null}
      filterOption={(inputValue, option) => {
        return option?.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
      }}
    />
  )
}

CustomAutoComplete.propTypes = {
  size: PropTypes.string,
  placeholder: PropTypes.string,
  defaultOpen: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ),
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onSearch: PropTypes.func
}
