import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import { TextInputSkeleton } from 'carbon-components-react'
import { useCombobox } from 'downshift'
import ListBox from 'carbon-components-react/lib/components/ListBox'
import { Sdk24 } from '@carbon/icons-react'
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
  children: PropTypes.any,
  isActive: PropTypes.bool,
  isHighlighted: PropTypes.bool
}

const executeOrReturn = val => {
  if (_.isFunction(val)) return val()

  if (_.isObject(val))
    return Object.fromEntries(
      Object.entries(val).filter(
        ([key, value]) => value !== null && value !== undefined && value !== ''
      )
    )

  return val
}

/** */
export const TypeAhead = ({
  id,
  objectType,
  queryParams,
  showDescription,
  description,
  initialInputValue,
  selectedItemsOnly,
  handleCreateNew,
  onFocusLost = () => {},
  autoFocus,
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
  setResetTypeAhead,
  renderPopup,
  onFocus,
  searchTicketId,
  pelKnownAsCust,
  skipSaveHistory = true
}) => {
  // Hack to cancel render if configured not to display.
  if (hidden) return null

  if (showSkeleton) return <TextInputSkeleton />

  const [, setSearchParams, response, hasnext, loading, , , , , showAddPopup] = useSearch(
    api,
    config.search
  )

  const search = (value, queryParams, openMenu) => {
    openMenu(true)
    if (pelKnownAsCust) {
      const isValue = value ? `pelknownascust="%${`${value}`}%"` : `pelknownascust=""`
      return setSearchParams(params => ({
        ...params,
        objectType: executeOrReturn(objectType),
        queryParams: {
          searchTerms: '',
          where: isValue
        },
        skipSaveHistory
      }))
    }
    if (usePelSearchTerms) {
      const isValue = value ? `pelsearchterms="${`${value}`}%"` : `pelsearchterms=""`
      const queryItems = queryParams?.where ? `${queryParams.where} and ${isValue}` : isValue

      return setSearchParams(params => ({
        ...params,
        objectType: executeOrReturn(objectType),
        queryParams: {
          where: queryItems
        },
        skipSaveHistory
      }))
    }

    if (searchTicketId) {
      return setSearchParams(params => ({
        ...params,
        objectType: executeOrReturn(objectType),
        queryParams: {
          savedQuery: null,
          where: `ticketid="${value}"`
        },
        skipSaveHistory
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
      },
      skipSaveHistory
    }))
  }

  const debounceSearch = useRef(null)

  if (!debounceSearch.current) {
    debounceSearch.current = _.debounce((value, queryParams, openMenu = () => {}) => {
      return search(value, queryParams, openMenu)
    }, 500)
  }

  const [items, setItems] = useState([])

  useEffect(() => {
    const checkPresent = (obj, array) => {
      const index = array.findIndex(ele => ele.pelknownascust === obj.pelknownascust)
      return {
        isPresent: index === -1,
        index
      }
    }
    const items = []
    if (pelKnownAsCust) {
      response.forEach(it => {
        const { isPresent, index } = checkPresent(it, items)
        if (isPresent) {
          items.push({
            customerslist: [
              {
                customer: it.customer,
                name: it.name,
                peldefbusunit: it.peldefbusunit,
                pelpomand: it.pelpomand,
                pelknownascust: it.pelknownascust
              }
            ],
            pelknownascust: it.pelknownascust
          })
        } else {
          items[index].customerslist.push({
            customer: it.customer,
            name: it.name,
            peldefbusunit: it.peldefbusunit,
            pelpomand: it.pelpomand,
            pelknownascust: it.pelknownascust
          })
        }
      })
    }
    setItems(
      (items.length && items.sort((a, z) => a.pelknownascust.localeCompare(z.pelknownascust))) ||
        response
    )
    renderPopup && renderPopup(showAddPopup)
  }, [response])

  useEffect(() => {
    if (preFetchData && preFetchData.length) {
      setItems(preFetchData)
    }
  }, [preFetchData])

  /** */
  const onInputValueChange = changes => {
    if (typeof onChange === 'function') {
      onChange(changes.inputValue)
    }
    // objectType === 'pelperson' && setModalOpen(true)
    // Only run search if selected item isn't the same.
    const { inputValue, selectedItem } = changes

    // Search term hasn't changed.
    if (itemToString(selectedItem) === inputValue) return

    // Call to external handler so input events can be dealt with.
    if (handleInputChange) {
      handleInputChange({ id, inputValue })
    }
    // Only run search on passing min char threshold.
    if (inputValue.length < config.search.minSearchLength) {
      setItems([])
      return
    }

    // return debounceSearch.current(queryParams, inputValue)
    return debounceSearch.current(_.trim(inputValue), queryParams)
  }

  /**
   * Reducer logic for enforcing selected items only when selectedItemsOnly flag is set.
   */
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
      case useCombobox.stateChangeTypes.InputChange: {
        const item = itemToString(state.selectedItem)

        if (item === changes.inputValue) {
          changes.selectedItem.location = ''
        }
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
    openMenu,
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

    /**
     * Array of 'items' from search results held in outer state.
     */
    items,
    stateReducer,

    /**
     * Handler for input changes.
     * Triggers the async search with search terms.
     */
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

  /**
   * Prevent Downshift's default 'Home/End' behavior to ensure keyboard selection
   * in input still works.
   */

  const handleKeyDown = e => {
    if (e.key === 'Home' || e.key === 'End') {
      e.nativeEvent.preventDownshiftDefault = true
    }
    if (e.key === 'Enter') {
      debounceSearch.current(_.trim(e?.target?.value), queryParams, openMenu)
    }
  }
  const handleReportedByOnBlur = (e, items) => {
    onFocusLost(e, items)
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
                {...getInputProps({
                  disabled,
                  readOnly,
                  autoFocus,
                  onKeyDown: handleKeyDown,
                  ...(objectType === 'pellocfull' && onFocus ? { onFocus: () => onFocus() } : {}),
                  onBlur: e => {
                    objectType === 'pelperson' ||
                    objectType === 'pelcustomer' ||
                    objectType === 'pellocfull'
                      ? handleReportedByOnBlur(e, items)
                      : items.length === 0 && onFocusLost(e)
                  }
                })}
                className="bx--text-input"
                autoComplete="new-password"
                placeholder={placeholder}
                type={type === 'number' ? 'number' : 'text'}
              />
              {handleCreateNew && showCreateButton && (
                <CreateButton description="Create new record" onClick={handleCreateNew} />
              )}
              {!disabled && !readOnly && items.length > 0 && (
                <button type="button" {...getToggleButtonProps()}>
                  <ListBox.MenuIcon isOpen={isOpen} />
                </button>
              )}

              <Progress isAnimating={loading} />
            </ListBox.Field>
            <div className="bx--list-box__menu typehead_menu" {...getMenuProps({ disabled })}>
              {!!isOpen &&
                items.map((item, index) => (
                  <ListBoxMenuItem
                    isHighlighted={highlightedIndex === index || false}
                    {...getItemProps({ item, index, key: itemToString(item) })}
                  >
                    {searchResult(item)}
                  </ListBoxMenuItem>
                ))}
              {hasnext && isOpen && items?.length !== 0 && (
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
  readOnly: PropTypes.any,
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
  type: PropTypes.string,
  renderPopup: PropTypes.func,
  modalOpen: PropTypes.bool,
  pelKnownAsCust: PropTypes.bool,
  autoFocus: PropTypes.bool,
  skipSaveHistory: PropTypes.bool,
  searchTicketId: PropTypes.bool,
  onFocus: PropTypes.func
}
