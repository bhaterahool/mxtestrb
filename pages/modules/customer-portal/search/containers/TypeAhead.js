import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import { TextInputSkeleton } from 'carbon-components-react'
import { useCombobox } from 'downshift'
import ListBox from 'carbon-components-react/lib/components/ListBox'
import { useSearch } from '../useSearch'
import { CreateButton } from '../components/CreateButton'


import { DescriptionText } from '../../../../shared/forms/DescriptionText'


import { api } from '../../../app/api'
import config from '../../../app/config'
import { Progress } from '../progress/Progress'

const ListBoxMenuItem = React.forwardRef(({ children, isActive, isHighlighted, ...rest }, ref) => {
  const className = cx({
    [`bx--list-box__menu-item`]: true,
    [`bx--list-box__menu-item--active`]: isActive,
    [`bx--list-box__menu-item--highlighted`]: isHighlighted
  })

  return (
    <div className={className} {...rest} ref={ref}>
      <div className="bx--list-box__menu-item__option">{children}</div>
    </div>
  )
})

ListBoxMenuItem.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  isActive: PropTypes.bool,
  isHighlighted: PropTypes.bool
}

const executeOrReturn = val => {
  if (_.isFunction(val)) return val()

  return val
}

export const TypeAhead = ({
  id,
  objectType,
  queryParams,
  showDescription,
  description,
  initialInputValue,
  selectedItemsOnly,
  handleCreateNew,
  onFocusLost,
  onSelectedItemChange,
  handleInputChange,
  itemToString,
  searchResult,
  disabled,
  type,
  labelText,
  hidden,
  readOnly,
  showSkeleton,
  showCreateButton,
  selectedItem,
  invalid,
  placeholder,
  preFetchData,
  usePelSearchTerms,
  onChange,
  resetTypeAhead,
  setResetTypeAhead
}) => {
  
  if (hidden) return null

  if (showSkeleton) return <TextInputSkeleton />

  const [, setSearchParams, response, hasnext, loading] = useSearch(api, config.search)

  const search = (value, queryParams) => {
    if (usePelSearchTerms) {
      return setSearchParams(params => ({
        ...params,
        objectType: executeOrReturn(objectType),
        queryParams: {
          where: `pelsearchterms="${`${value}`}"`
        }
      }))
    }
    return setSearchParams(params => ({
      ...params,
      objectType: executeOrReturn(objectType),
      queryParams: {
        searchTerms: `${_.trim(value)
          .split(' ')
          .join('_')}`,
        ...executeOrReturn(queryParams)
      }
    }))
  }

  const debounceSearch = useRef(null)

  if (!debounceSearch.current) {
    debounceSearch.current = _.debounce((value, queryParams) => {
      return search(value, queryParams)
    }, 500)
  }

  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(response)
  }, [response])

  useEffect(() => {
    if (preFetchData && preFetchData.length) {
      setItems(preFetchData)
    }
  }, [preFetchData])

    const onInputValueChange = changes => {
    if (typeof onChange === 'function') {
      onChange(changes.inputValue)
    }
    
    const { inputValue, selectedItem } = changes

    if (!inputValue) {
      setItems([])
    }

    
    if (itemToString(selectedItem) === inputValue) return

    
    if (handleInputChange) {
      handleInputChange({ id, inputValue })
    }

    
    if (inputValue.length < config.search.minSearchLength) return

    
    return debounceSearch.current(_.trim(inputValue), queryParams)
  }

    const stateReducer = (state, actionAndChanges) => {
    const { type, changes } = actionAndChanges

    if (!selectedItemsOnly) return changes

    switch (type) {
      case useCombobox.stateChangeTypes.InputBlur: {
        const item = itemToString(state.selectedItem)

        if (item !== changes.inputValue) {
          changes.selectedItem = null
          changes.inputValue = ''
        }
        break
      }
      case useCombobox.stateChangeTypes.InputKeyDownEnter: {
        changes.isOpen = true
        break
      }
      default:
        break
    }

    return changes
  }

  const {
    getInputProps,
    getMenuProps,
    getItemProps,
    getComboboxProps,
    highlightedIndex,
    isOpen,
    reset,
    getToggleButtonProps,
    ...props
  } = useCombobox({
    id,

    /**
     * The Carbon/ComboBox component wasn't allowing for this.
     */
    initialInputValue,

    selectedItem,

        items,

        stateReducer,

        onInputValueChange,

    onSelectedItemChange,

        itemToString
  })

  useEffect(() => {
    if (resetTypeAhead) {
      reset()
      setResetTypeAhead(false)
    }
  }, [resetTypeAhead])

  const className = cx({
    'pel--combo-box': true,
    'has-description': showDescription,
    invalid
  })

    const handleKeyDown = e => {
    if (e.key === 'Home' || e.key === 'End') {
      
      e.nativeEvent.preventDownshiftDefault = true
    }

    if (e.key === 'Enter') {
      debounceSearch.current(_.trim(e?.target?.value), queryParams)
    }
  }

  return (
    <div className={className}>
      <div className="bx--form-item bx--text-input-wrapper pel--typeahead">
        {labelText && (
          <label className="bx--label" htmlFor={id}>
            {labelText}
          </label>
        )}
        <div className="pel--typeahead-field-wrapper">
          <ListBox {...getComboboxProps()} className="bx--combo-box bx--list-box">
            <ListBox.Field id={`lb${id}`}>
              <input
                {...getInputProps({ disabled, readOnly, onKeyDown: handleKeyDown })}
                className="bx--text-input"
                autoComplete="off"
                placeholder={placeholder}
                type={type === 'number' ? 'number' : 'text'}
                onBlur={items.length === 0 && onFocusLost}
              />
              {handleCreateNew && showCreateButton && (
                <CreateButton description="Create new record" onClick={handleCreateNew} />
              )}
              {!disabled && !readOnly && (
                <button type="button" {...getToggleButtonProps()}>
                  <ListBox.MenuIcon isOpen={isOpen} />
                </button>
              )}

              <Progress isAnimating={loading} />
            </ListBox.Field>
            <div className="bx--list-box__menu" {...getMenuProps({ disabled })}>
              {!isOpen
                ? null
                : items.map((item, index) => (
                    <ListBoxMenuItem
                      isHighlighted={highlightedIndex === index || false}
                      {...getItemProps({ item, index, key: itemToString(item) })}
                    >
                      {searchResult(item)}
                    </ListBoxMenuItem>
                  ))}
              {hasnext && isOpen && (
                <div className="pel--search-has-next">Too many results to load</div>
              )}
            </div>
          </ListBox>
          {showDescription && <DescriptionText text={description} />}
        </div>
      </div>
    </div>
  )
}

TypeAhead.propTypes = {
  description: PropTypes.string,
  showCreateButton: PropTypes.bool,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool,
  id: PropTypes.string,
  initialInputValue: PropTypes.string,
  itemToString: PropTypes.func,
  labelText: PropTypes.string,
  name: PropTypes.string,
  objectType: PropTypes.string,
  queryParams: PropTypes.shape({
    where: PropTypes.string,
    searchTerms: PropTypes.string
  }),
  readOnly: PropTypes.bool,
  searchResult: PropTypes.func,
  selectedItemsOnly: PropTypes.bool,
  showDescription: PropTypes.bool,
  showSkeleton: PropTypes.bool,
  onSelectedItemChange: PropTypes.func,
  handleCreateNew: PropTypes.func,
  onFocusLost: PropTypes.func,
  placeholder: PropTypes.string,
  invalid: PropTypes.bool,
  handleInputChange: PropTypes.func,
  selectedItem: PropTypes.shape({}),
  preFetchData: PropTypes.instanceOf(Array),
  usePelSearchTerms: PropTypes.bool,
  onChange: PropTypes.func,
  setResetTypeAhead: PropTypes.func,
  resetTypeAhead: PropTypes.bool,
  type: PropTypes.string
}
