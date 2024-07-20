import React, { useCallback, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import _ from 'lodash'
import { Tabs, Tab, Button, SelectItem, Select, Modal } from 'carbon-components-react'
import { EditPanel, ServiceRequestType, ReviewPanel, SRPriorityInput } from '../components'
import { DiagnosisWizard } from '../components/diagnosis'
import { addSchemaToEditorConfig } from '../../../shared/addSchemaToEditorConfig'
import { useRegistry } from '../../../shared/RegistryProvider'
import { serviceRequest } from '../props/serviceRequest'
import { useServiceRequestSearchProvider } from '../search/SearchProvider'
import { useControls } from '../hooks/useControls'
import { PelTextInput } from '../../../shared/forms'

const editorConfig = new Map([
  [
    'ticketid',
    {
      readOnly: true
    }
  ],
  ['ticketid.infosr', {}],
  ['pluspcustomer[0].customer', {}],
  [
    'reportdate',
    {
      readOnly: true
    }
  ],
  [
    'description',
    {
      hidden: true
    }
  ],
  ['pelclientref', {}],
  ['pluspcustponum', {}],
  ['reportedbyname', {}],
  ['reportedemail', {}],
  ['reportedphone', {}],
  [
    'origrecordid',
    {
      labelText: 'Existing SR Ref'
    }
  ],
  ['affectedusername', {}],
  ['affectedemail', {}],
  ['affectedphone', {}],
  ['pellocbuilding'],
  ['location', {}],
  [
    'locadd',
    {
      hidden: true
    }
  ],
  ['assetnum', {}]
])

const reviewConfig = new Map([
  [
    'ticketid',
    {
      hidden: true
    }
  ],
  ['pluspcustomer[0].customer', {}],
  [
    'reportdate',
    {
      hidden: true
    }
  ],
  [
    'description',
    {
      labelText: 'Description'
    }
  ],
  ['pelclientref', {}],
  ['pluspcustponum', {}],
  ['reportedbyname', {}],
  ['reportedemail', {}],
  ['reportedphone', {}],
  [
    'origrecordid',
    {
      labelText: 'Existing SR Ref'
    }
  ],
  ['affectedusername', {}],
  ['affectedemail', {}],
  ['affectedphone', {}],
  ['pellocbuilding'],
  ['location', {}],
  [
    'locadd',
    {
      hidden: true
    }
  ],
  ['assetnum', {}],
  ['classstructureid', {}],
  ['classstructurename', {}],
  ['pelsrtype', {}],
  [
    'ownergroup',
    {
      labelText: 'Owner Group'
    }
  ],
  [
    'owner',
    {
      labelText: 'Owner'
    }
  ],
  [
    'pelreportascrit',
    {
      hidden: false
    }
  ],
  [
    'pelreportashs',
    {
      hidden: false
    }
  ],
  ['ticketspec', {}]
])

export const CreateLayout = ({
  sr,
  errors,
  personid,
  pelbusunit,
  busUnits,
  handleChange,
  handleSubmit,
  handleSearchParams,
  handleSelectTicket,
  handleTypeChange,
  ticketId,
  userPluspcustomer,
  isLeafNodeSelected,
  isBranchSelected,
  srTypesCondition,
  maximoExceptionErrors
}) => {
  const methods = useForm()

  const [selectedTab, setSelectedTab] = useState(0)

  const { doFormSearch } = useServiceRequestSearchProvider()

  const [registry] = useRegistry()

  
  const [form, setForm] = useState({
    description: sr?.description || '',
    description_longdescription: sr?.description_longdescription || ''
  })

  const [toggleControl, getControlProps, controls] = useControls({
    resolveSRConfirmation: {
      active: false,
      props: null
    }
  })

  useEffect(() => {
    handleChange(ticketId, form)
  }, [form])

  addSchemaToEditorConfig(registry.pelsrfullschema, editorConfig)

  const readOnly = ['CLOSED', 'RESOLVED'].includes(sr?.status)
  const readOnlyBasedOnType = ['CH', 'RC'].includes(sr?.pelsrtype)

  const getInputProps = name => {
    const props = {
      id: name,
      name,
      ...editorConfig.get(name)
    }

    if (readOnly) {
      props.readOnly = true
    }
    return props
  }

  addSchemaToEditorConfig(registry.pelsrfullschema, reviewConfig)

  const getReviewFieldProps = useCallback(
    name => ({
      id: name,
      name,
      ...reviewConfig.get(name)
    }),
    []
  )

  const handleNextClick = tabIndex => e => {
    e.preventDefault()
    setSelectedTab(tabIndex)
  }

    const handleFormChange = (name, value) => {
    setForm(form => ({
      ...form,
      [name]: value
    }))
  }

    const handleClassification = (
    classstructureid,
    attributes,
    leafNodeStatus,
    supressChangeHandler
  ) => {
    
    if (classstructureid) {
      let ticketspec = attributes?.map(data => data)

      if (sr.ticketid) {
        ticketspec = ticketspec?.map(data => {
          return {
            assetattrid: data.assetattrid,
            type: data.type,
            value: data.tablevalue || data.alnvalue || data.numvalue,
            [data.type]: data.tablevalue || data.alnvalue || data.numvalue
          }
        })
      }
      if (!supressChangeHandler) {
        handleChange(ticketId, { classstructureid, ticketspec }, true, leafNodeStatus)
      } else {
        doFormSearch(sr, { classstructureid: form.classstructureid })
      }
    } else {
      handleChange(ticketId, { classstructureid: '' }, false, false)
    }
  }

  /**
   * Update priority.
   */

  const handlePriorityChange = internalpriority => {
    handleChange(ticketId, {
      internalpriority: internalpriority || null,
      pelprioritychangedesc: ''
    })
  }

  /**
   * Update priority description.
   */

  const handlePriorityDescChange = e => {
    const pelprioritychangedesc = e.target.value
    if (pelprioritychangedesc) {
      handleChange(ticketId, { pelprioritychangedesc })
    }
  }

  const handleResolve = () => {
    toggleControl('resolveSRConfirmation')
  }

  const resolveSR = () => {
    handleChange(ticketId, { status: 'RESOLVED' })
    handleSubmit()
    toggleControl('resolveSRConfirmation')
  }

  const changeReason =
    registry.priorityChangeDescList.find(pcd => pcd.value === sr?.pelprioritychangedesc)
      ?.description || sr?.pelprioritychangedesc

  const maximoExceptionError = maximoExceptionErrors?.get(ticketId)
  const isMaximoThrownException = maximoExceptionError?.error ?? false

  return (
    <FormProvider {...methods}>
      <Tabs selectionMode="manual" onSelectionChange={setSelectedTab} selected={selectedTab}>
        <Tab label="General Details">
          <section className="pel--container pel--has-footer-bar">
            <div className="bx--grid">
              <div className="bx--row">
                <div className="bx--col bx--no-gutter">
                  <EditPanel
                    sr={sr}
                    errors={errors}
                    ticketId={ticketId}
                    getInputProps={getInputProps}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleSearchParams={handleSearchParams}
                    handleSelectTicket={handleSelectTicket}
                    key={`editor-${ticketId}`}
                    statusTypes={registry.statusTypes}
                    personid={personid}
                    pelbusunit={pelbusunit}
                    busUnits={busUnits}
                    userPluspcustomer={userPluspcustomer}
                    isCreateLayout
                    readOnly={readOnly}
                    handleTypeChange={handleTypeChange}
                  />
                  <div className="bx--row pel--footer-bar">
                    <Button type="button" onClick={handleNextClick(1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Tab>
        <Tab label="Diagnosis &amp; Classification">
          <DiagnosisWizard
            errors={errors}
            handleSelect={handleClassification}
            handleFormChange={handleFormChange}
            description={form.description}
            description_longdescription={form.description_longdescription}
            customer={sr?.pluspcustomer?.[0]?.customer}
            classstructureid={
              sr?.ticketid ? sr?.classstructure?.[0]?.classstructureid : sr?.classstructureid
            }
            origrecordid={sr?.origrecordid}
            pelreportascrit={sr?.pelreportascrit}
            pelreportashs={sr?.pelreportashs}
            ticketspec={sr?.ticketspec}
            pelsrtype={sr?.pelsrtype}
            getInputProps={getInputProps}
            selectedTab={selectedTab}
            readOnly={readOnly || readOnlyBasedOnType}
          />
          <div className="bx--row pel--footer-bar">
            <Button type="button" onClick={handleNextClick(2)}>
              Next
            </Button>
          </div>
        </Tab>
        <Tab label={readOnly ? 'Review' : 'Review & Save'}>
          <section className="pel--container pel--has-footer-bar">
            <div className="bx--grid">
              <div className="bx--row">
                <div className="bx--col-lg-10">
                  <div className="flex">
                    <div className="flex-10">
                      <SRPriorityInput
                        internalpriority={sr?.internalpriority}
                        handleChange={handlePriorityChange}
                        priorityTypes={registry.prioritiesList}
                        location={sr?.location || sr?.pellocbuilding}
                        assetnum={sr?.assetnum}
                        classstructureid={sr?.classstructureid}
                        classstructureidOld={sr?.classstructureidOld}
                        isLeafNodeSelected={isLeafNodeSelected}
                        isBranchSelected={isBranchSelected}
                        ticketspec={sr?.ticketspec}
                        siteid={sr?.siteid}
                        pelsrtype={sr?.pelsrtype || ''}
                        srTypesCondition={srTypesCondition}
                        readOnly={readOnly}
                        pluspcustomer={sr?.pluspcustomer?.[0]?.customer}
                        skipprioritycalculation={sr?.skipprioritycalculation}
                      />
                    </div>
                    {(readOnly ||
                      (sr?.internalpriority &&
                        localStorage.getItem('calculatedInternalPriority') ===
                          sr?.internalpriority?.toString())) &&
                      sr?.pelprioritychangedesc && (
                        <div className="indent">
                          <PelTextInput
                            id="pelprioritychangedesc-readonly"
                            name="pelprioritychangedesc-readonly"
                            labelText="Priority Change Description"
                            value={changeReason}
                            readOnly
                            light
                          />
                        </div>
                      )}
                    {!readOnly &&
                      sr?.internalpriority &&
                      localStorage.getItem('calculatedInternalPriority') !==
                        sr?.internalpriority?.toString() && (
                        <Select
                          id="pelprioritychangedesc"
                          name="pelprioritychangedesc"
                          className="flex pel--text-input flex-1 indent"
                          labelText="Priority Change Description"
                          onChange={handlePriorityDescChange}
                          value={sr?.pelprioritychangedesc}
                          readOnly={readOnly}
                          disabled={readOnly}
                        >
                          <SelectItem text="Select a reason" />
                          {_.map(registry.priorityChangeDescList, unit => (
                            <SelectItem
                              text={unit.description}
                              value={unit.value}
                              key={unit.value}
                            />
                          ))}
                        </Select>
                      )}
                  </div>
                </div>
              </div>
              <div className="bx--row">
                <div className="bx--col-lg-10 bx--no-gutter">
                  <ReviewPanel sr={sr} getInputProps={getReviewFieldProps} />
                </div>
              </div>
            </div>
            <div className="bx--row pel--footer-bar">
              {sr?.pelsrtype === 'IN' && sr?.status === 'WAPPR' && (
                <Button onClick={handleResolve}>Resolve</Button>
              )}
              {!readOnly && (
                <Button
                  type="submit"
                  disabled={isMaximoThrownException}
                  onClick={methods.handleSubmit(handleSubmit)}
                >
                  {sr?.ticketid ? 'Save Changes' : 'Create Service Request'}
                </Button>
              )}
            </div>
          </section>
        </Tab>
      </Tabs>{' '}
      <Modal
        open={controls.resolveSRConfirmation.active}
        modalHeading="Resolve Service Request"
        primaryButtonText="Resolve Service Request"
        secondaryButtonText="Cancel"
        onRequestSubmit={resolveSR}
        onRequestClose={() => {
          toggleControl('resolveSRConfirmation')
        }}
      >
        Are you sure you want to Resolve this Service Request?
      </Modal>
    </FormProvider>
  )
}

CreateLayout.propTypes = {
  handleChange: PropTypes.func,
  handleTypeChange: PropTypes.func.isRequired,
  handleSearchParams: PropTypes.func,
  handleSelectTicket: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleResolve: PropTypes.func,
  sr: serviceRequest,
  ticketId: PropTypes.string.isRequired,
  personid: PropTypes.string,
  pelbusunit: PropTypes.string,
  busUnits: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  ),
  userPluspcustomer: PropTypes.string,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      message: PropTypes.string
    })
  ),
  srTypesCondition: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      alnvalue: PropTypes.string,
      srtype: PropTypes.string
    })
  ),
  isLeafNodeSelected: PropTypes.bool,
  isBranchSelected: PropTypes.bool,
  maximoExceptionErrors: PropTypes.arrayOf(
    PropTypes.shape({
      ticketId: PropTypes.string,
      error: PropTypes.bool
    })
  )
}
