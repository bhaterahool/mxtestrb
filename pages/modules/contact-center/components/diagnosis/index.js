import React, { useEffect, useRef, useReducer, useState } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ReactQuill from 'react-quill'
import { TextInput, Checkbox, Loading } from 'carbon-components-react'
import { ClassOptionsList } from './ClassOptionsList'
import { ClassAttributesList } from './ClassAttributesList'
import { GuidanceNotes } from './GuidanceNotes'
import { ClassificationSearchResult } from './ClassificationSearchResult'
import { BreadCrumb } from './BreadCrumb'
import { useRegistry } from '../../../../shared/RegistryProvider'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { TypeAhead } from '../../search/containers/TypeAhead'

import {
  reducer,
  getNodesByParent,
  getAttributes,
  getNodesFromAncestors,
  getGuidanceNotes
} from './reducer'
import { useFormModel } from '../../hooks/useFormModel'

const getRelativeParent = state => {
  const { classstructureid, nodes, leafs } = state

  if (!classstructureid) return

  if (leafs.includes(classstructureid)) {
    return nodes[nodes[classstructureid].parent]
  }

  return nodes[classstructureid]
}

const isInvalid = (name, errors) => errors.find(error => error.field === name)


const applyAttrDefaults = attrs => {
  return attrs?.map(attr => {
    if (!attr.classspecusewith || !attr.classspecusewith.length) return attr

    const attrType = attr?.assetattribute?.[0]?.datatype?.toLowerCase()

    const classspec = attr?.classspecusewith?.filter(classspec => classspec.objectname === 'SR')

    
    if (classspec.length && !attr[`${attrType}value`]) {
      return {
        ...attr,
        value: classspec[0][`default${attrType}value`],
        [`${attrType}value`]: `${attrType}value`
      }
    }

    return attr
  })
}



const hackToFormat = (available, attrs) => {
  return attrs?.map(attr => {
    const orig = available.find(av => av.classspecid === attr.classspecid)

    if (!attr.value && orig) {
      const type = orig?.assetattribute?.[0].datatype?.toLowerCase()

      const key = `${type}value`
      return {
        assetattrid: orig.assetattrid,
        type: key,
        value: attr[key]
      }
    }

    return {
      ...attr,
      type: attr.type ?? 'tablevalue'
    }
  })
}
export const DiagnosisWizard = ({
  handleSelect,
  handleFormChange,
  pelreportashs,
  pelreportascrit,
  description,
  description_longdescription,
  classstructureid,
  origrecordid,
  ticketspec,
  customer,
  errors,
  pelsrtype,
  getInputProps,
  selectedTab,
  readOnly
}) => {
  const [{ classifications }] = useRegistry()
  const { addErrorToast } = useToast()
  const [longDescription, setLongDescription] = useState(description_longdescription)
  const readOnlyBasedOnType = ['CH', 'RC'].includes(pelsrtype)

  const [state, dispatch] = useReducer(reducer, {
    classstructureid,
    leafs: [],
    nodes: [],
    complete: false,
    attributes: ticketspec
  })

  const { form, setClassification } = useFormModel()

  const handleCheckBoxChange = (value, name) => {
    if (!readOnly) {
      handleFormChange(name, value)
    }
  }

  const handleInputChange = e => {
    const {
      target: { name, value }
    } = e

    if (value.length <= 100) {
      handleFormChange(name, value)
    } else {
      addErrorToast({
        subtitle: 'Characters limit 100',
        caption: 'Limit exceed'
      })
    }
  }

  const quillref = useRef()

  useEffect(() => {
    handleFormChange('description_longdescription', longDescription)
  }, [selectedTab])

  const handleLongDescChange = value => {
    if (!value) return
    const editor = quillref?.current?.getEditor()
    const textLength = editor?.getLength()
    if (textLength > 32000) {
      setLongDescription(value?.slice(0, 32000))
      addErrorToast({
        subtitle: 'Characters limit 32000',
        caption: 'Limit exceed'
      })
    } else {
      setLongDescription(value)
    }
  }

  const handleAttribute = (assetattrid, classspecid, value, type) => {
    if (!readOnly) {
      dispatch({
        type: 'SELECT_ATTRIBUTE',
        payload: {
          attribute: { assetattrid, classspecid, value, type }
        }
      })
    }
  }

    useEffect(() => {
    dispatch({
      type: 'LOAD_HIERARCHY',
      payload: {
        nodes: classifications,
        customer,
        attributes: ticketspec,
        classstructureid
      }
    })
  }, [customer, classifications, origrecordid])

  const nodes = getNodesFromAncestors(state.nodes[state.classstructureid], state.nodes)

  const attributes = getAttributes([...nodes, state.nodes[state.classstructureid]])

  
  const findAttribType = value => {
    if (value.alnvalue) {
      return 'alnvalue'
    }
    if (value.numvalue) {
      return 'numvalue'
    }
    return 'tablevalue'
  }

  const [resetTypeAhead, setResetTypeAhead] = useState(false)

  const handleSelection = classstructureid => {
    if (readOnly) return

    
    
    const attrs = getAttributes([...nodes, state.nodes[classstructureid]])

    setClassification(state?.nodes[classstructureid])
    const ticketspecOnClassification = classstructureid ? ticketspec : []
    if (!classstructureid && !resetTypeAhead) {
      setResetTypeAhead(true)
    }
    let ticketspecattr = ticketspecOnClassification?.map(data => data)
    ticketspecattr = ticketspecattr?.map(data => {
      return {
        assetattrid: data.assetattrid,
        type: findAttribType(data), 
        value: data.tablevalue || data.alnvalue || data.numvalue,
        [findAttribType(data)]: data.tablevalue || data.alnvalue || data.numvalue
      }
    })

    return dispatch({
      type: 'SELECT_CLASSIFICATION',
      payload: {
        classstructureid,
        attributes: applyAttrDefaults(attrs.length > 0 ? attrs : ticketspecattr)
      }
    })
  }

  
  const handleSelectionOnInitialRun = classstructureid => {
    if (!readOnly) return

    
    
    const attrs = getAttributes([...nodes, state.nodes[classstructureid]])

    setClassification(state?.nodes[classstructureid])
    const ticketspecOnClassification = classstructureid ? ticketspec : []
    if (!classstructureid && !resetTypeAhead) {
      setResetTypeAhead(true)
    }
    let ticketspecattr = ticketspecOnClassification?.map(data => data)
    ticketspecattr = ticketspecattr?.map(data => {
      return {
        assetattrid: data.assetattrid,
        type: findAttribType(data), 
        value: data.tablevalue || data.alnvalue || data.numvalue,
        [findAttribType(data)]: data.tablevalue || data.alnvalue || data.numvalue
      }
    })

    return dispatch({
      type: 'SELECT_CLASSIFICATION',
      payload: {
        classstructureid,
        attributes: applyAttrDefaults(attrs.length > 0 ? attrs : ticketspecattr)
      }
    })
  }

  const updateClassification = item => {
    handleSelection(item?.selectedItem?.classstructureid)
  }

    useEffect(() => {
    if (state.classstructureid) {
      handleSelect(
        state.classstructureid,
        hackToFormat(attributes, state.attributes),
        classifications?.some(
          classification =>
            classification.classstructureid === state.classstructureid &&
            !classification.haschildren
        )
      )
      setClassification(
        classifications?.find(
          classification => classification?.classstructureid === state.classstructureid
        )
      )
    } else if (origrecordid && classstructureid) {
      handleSelect(
        classstructureid,
        hackToFormat(attributes, ticketspec),
        classifications?.some(
          classification =>
            classification.classstructureid === classstructureid && !classification.haschildren
        ),
        true
      )
      handleSelectionOnInitialRun(classstructureid)
    } else {
      handleSelect()
    }
  }, [state.complete, state.attributes, origrecordid])

  const guidance = getGuidanceNotes([...nodes, state.nodes[state.classstructureid]])

  const quillClassname = cx({
    invalid: isInvalid('description_longdescription', errors) || !description_longdescription
  })

  if (!classifications?.length) {
    return (
      <div className="diagnosis pel--container pel--has-footer-bar">
        <div className="bx--grid">
          <h4>Loading Classification Data</h4>
          <Loading small withOverlay={false} description="Loading Classification Data" />
        </div>
      </div>
    )
  }

    return (
    <div className="diagnosis pel--container pel--has-footer-bar">
      <div className="bx--grid">
        <div className="bx--row">
          <div className="bx--col-lg-6">
            <div className="bx--row diagnosis-utility">
              <BreadCrumb
                node={state.nodes[state.classstructureid]}
                handleSelection={handleSelection}
                key={state.classstructureid}
                readOnly={readOnly}
              />
              <TypeAhead
                {...getInputProps('classstructurename')}
                searchResult={item => <ClassificationSearchResult classification={item} />}
                itemToString={item => item?.description || ''}
                selectedItemsOnly
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                onSelectedItemChange={updateClassification}
                objectType="PELDIAGNOSIS"
                invalid={(pelsrtype === 'RW' || !pelsrtype) && !state.classstructureid}
                selectedItem={{
                  description: form.classstructurename,
                  hierarchypath: form.classstructurename
                }}
                queryParams={{
                  where: customer
                    ? `pluspisglobal=1 and pluspcustassoc.customer="${customer}"`
                    : `pluspisglobal=1`,
                  opmodeor: 1
                }}
                readOnly={readOnly}
                labelText="‎"
              />
            </div>
            <div className="bx--row">
              <ClassOptionsList
                nodes={
                  getNodesByParent(state.nodes, state.classstructureid, state.leafs) || {
                    classstructureid: ''
                  }
                }
                handleSelection={handleSelection}
                path={state.path}
                classstructureid={state.classstructureid || ''}
                complete={state.complete}
                question={getRelativeParent(state)?.pelchildquestion}
                readOnly={readOnly}
              />
            </div>
            <div className="bx--row">
              <ClassAttributesList
                attributes={attributes}
                selectedAttributes={state.attributes}
                handleAttribute={handleAttribute}
                readOnly={readOnly}
              />
            </div>
            <div className="bx--row">
              <GuidanceNotes guidance={guidance} />

              <div>
                <h4>Criticality</h4>
                <fieldset className="bx--fieldset" readOnly={readOnly}>
                  <Checkbox
                    labelText="Health and Safety"
                    id="pelreportashs"
                    name="pelreportashs"
                    onChange={handleCheckBoxChange}
                    checked={pelreportashs || false}
                  />
                  <Checkbox
                    labelText="Business Critical"
                    id="pelreportascrit"
                    name="pelreportascrit"
                    onChange={handleCheckBoxChange}
                    checked={pelreportascrit || false}
                  />
                </fieldset>
              </div>
            </div>
          </div>
          <div className="bx--col-lg-6">
            <TextInput
              id="description"
              name="description"
              labelText="Description"
              onChange={handleInputChange}
              value={description}
              autoComplete="off"
              invalid={isInvalid('description', errors) || !description}
              readOnly={readOnly && !readOnlyBasedOnType}
            />
            <div tabIndex="0" onFocus={() => quillref.current.focus()}>
              <ReactQuill
                value={longDescription}
                className={quillClassname}
                onChange={handleLongDescChange}
                ref={quillref}
                readOnly={readOnly && !readOnlyBasedOnType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

DiagnosisWizard.propTypes = {
  handleSelect: PropTypes.func.isRequired,
  handleFormChange: PropTypes.func.isRequired,
  description: PropTypes.string,
  description_longdescription: PropTypes.string,
  classstructureid: PropTypes.string,
  origrecordid: PropTypes.string,
  pelsrtype: PropTypes.string,
  customer: PropTypes.string,
  pelreportascrit: PropTypes.bool,
  pelreportashs: PropTypes.any,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      message: PropTypes.string
    })
  ),
  ticketspec: PropTypes.any,
  getInputProps: PropTypes.func,
  selectedTab: PropTypes.number,
  ClassOptionsList: PropTypes.bool,
  readOnly: PropTypes.bool
}
