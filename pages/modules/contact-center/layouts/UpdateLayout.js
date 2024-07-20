import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useForm, FormProvider } from 'react-hook-form'
import { Tabs, Tab, Button, Modal } from 'carbon-components-react'
import {
  InfoPanel,
  EditPanel,
  CostBillingForm,
  DoclinksList,
  WorkLogs,
  ClientApproval,
  ClientApprovalNew,
  ServiceRequestWorkOrders
} from '../components'
import { useObject } from '../../../shared/hooks/useObject'
import { addSchemaToEditorConfig } from '../../../shared/addSchemaToEditorConfig'


import { api } from '../../app/api'
import { useRegistry } from '../../../shared/RegistryProvider'
import { Loading } from '../../shared-components/Loading'
import { serviceRequest } from '../props/serviceRequest'
import { useControls } from '../hooks/useControls'

const editorConfig = new Map([
  [
    'ticketid',
    {
      readOnly: true
    }
  ],
  ['ticketid.infosr', { hidden: true }],
  [
    'reportdate',
    {
      readOnly: true
    }
  ],
  [
    'pluspcustomer[0].customer',
    {
      readOnly: true
    }
  ],
  ['description', {}],
  ['pelclientref', {}],
  ['pluspcustponum', {}],
  ['reportedbyname', {}],
  ['reportedemail', {}],
  ['reportedphone', {}],
  [
    'origrecordid',
    {
      hidden: true
    }
  ],
  ['affectedusername', {}],
  ['affectedemail', {}],
  ['affectedphone', {}],
  [
    'pellocbuilding',
    {
      readOnly: true
    }
  ],
  ['location', {}],
  [
    'locadd',
    {
      readOnly: true
    }
  ],
  ['assetnum', {}],
  [
    'pelcarapprvalue',
    {
      readOnly: true
    }
  ],
  [
    'pelcarapprover',
    {
      readOnly: true
    }
  ],
  [
    'pelcarapprref',
    {
      readOnly: true
    }
  ],
  [
    'pelcarstatus',
    {
      readOnly: true
    }
  ],
  [
    'pelcarstdate',
    {
      readOnly: true
    }
  ],
  [
    'ownergroup',
    {
      hidden: true
    }
  ],
  [
    'owner',
    {
      hidden: true
    }
  ],
  [
    'pelreportascrit',
    {
      readOnly: true,
      labelText: 'Business Critical'
    }
  ],
  [
    'pelreportashs',
    {
      readOnly: true,
      labelText: 'Health and Safety'
    }
  ],
  [
    'pelmandatestatus',
    {
      readOnly: true,
      labelText: 'Mandate Status'
    }
  ],
  [
    'pelpropmandateprice',
    {
      readOnly: true,
      labelText: 'Mandate Price'
    }
  ]
])


const withFormObject = BaseComponent => ({ objectType, query, ...props }) => {
  const { loading, data, error } = useObject(api, objectType, query)

  if (loading) return <Loading />

  return <BaseComponent data={data} error={error} {...props} />
}

const DoclinksWithFormObject = withFormObject(DoclinksList)
const WorkLogsWithFormObject = withFormObject(WorkLogs)
const ClientApWithFormObject = withFormObject(ClientApproval)

export const UpdateLayout = ({
  sr,
  handleChange,
  handleSubmit,
  reload,
  handleSearchParams,
  handleSelectTicket,
  selectedTicketId,
  userPluspcustomer,
  errors,
  
  busUnits,
  ...props
}) => {
  const methods = useForm()
  const [registry] = useRegistry()

  const [toggleControl, getControlProps, controls] = useControls({
    resolveSRConfirmation: {
      active: false,
      props: null
    }
  })

  useEffect(() => {
    addSchemaToEditorConfig(registry.pelsrfullschema, editorConfig)
  }, [registry.pelsrfullschema])

  const readOnly = ['CLOSED', 'RESOLVED'].includes(sr?.status)

  const isStatusAllowedToResolve = ['INPRG', 'WAPPR'].includes(sr?.status)

  const isTypeAllowedToResolveType = ['IN', 'CP', 'CC'].includes(sr?.pelsrtype)

  const handleResolve = () => {
    toggleControl('resolveSRConfirmation')
  }

  const resolveSR = () => {
    handleChange(selectedTicketId, { status: 'RESOLVED' })
    handleSubmit()
    toggleControl('resolveSRConfirmation')
  }

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

  return (
    <>
      <FormProvider {...methods}>
        <Tabs>
          <Tab label="General Details">
            <section className="pel--container pel--has-footer-bar">
              <div className="bx--grid">
                <div className="bx--row">
                  <div className="bx--col bx--no-gutter">
                    <EditPanel
                      sr={sr}
                      ticketId={selectedTicketId}
                      getInputProps={getInputProps}
                      handleChange={handleChange}
                      handleSubmit={handleSubmit}
                      handleSearchParams={handleSearchParams}
                      userPluspcustomer={userPluspcustomer}
                      handleSelectTicket={handleSelectTicket}
                      busUnits={busUnits}
                      errors={errors}
                      loading={!sr?.ticketid}
                      readOnly={readOnly}
                      isCreateLayout={false}
                    />
                    <div className="bx--row pel--footer-bar">
                      <div className="button-wrapper">
                        {isTypeAllowedToResolveType && isStatusAllowedToResolve && (
                          <Button className="pel-resolve-btn" onClick={handleResolve}>
                            Resolve
                          </Button>
                        )}
                        {!readOnly && (
                          <Button type="submit" onClick={handleSubmit}>
                            Save Changes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bx--row">
                  {sr?.mitiscareq && (
                    <div className="bx--grid bx--grid--full-width">
                      <h4 className="pel--sub-header">Approval History</h4>
                      <ClientApWithFormObject
                        objectType="mitcahistory"
                        query={`oslc.select=ticketid,mitcahistoryid,changedate,changeby,mitcastatus,mitcadate,mitcaperson,mitcateam,mitcareason,mitcostcode,siteid&oslc.where=ticketid="${selectedTicketId}"&oslc.orderby=changedate`}
                        readOnly={readOnly}
                        hideCreateButton={readOnly}
                      />
                    </div>
                  )}
                  <div className="bx--col-lg-8 bx--no-gutter">
                    {sr && <ServiceRequestWorkOrders sr={sr} reload={reload} />}
                  </div>
                </div>
              </div>
            </section>
          </Tab>
          <Tab label="Cost &amp; Billing">
            <section className="pel--container">
              <div className="bx--grid bx--grid--full-width">
                <div className="bx--row">
                  <CostBillingForm getInputProps={getInputProps} loading={!sr?.ticketid} sr={sr} />
                </div>
              </div>
            </section>
          </Tab>
          <Tab label="Log Notes">
            <WorkLogsWithFormObject
              objectType="pelsrlogs"
              query={`oslc.select=ticketid,worklog{ worklogid,createdate,logtype,createby,clientviewable,recordkey,description,description_longdescription,logtype_description,person{displayname,primaryemail,primaryphone}}&oslc.where=ticketid="${selectedTicketId}"`}
              logTypes={registry.logTypes}
              readOnly={readOnly}
              hideCreateButton={readOnly}
            />
          </Tab>
          <Tab label="Documents">
            <DoclinksWithFormObject
              objectType="pelsrdocs"
              query={`oslc.select=relatedrecord{*,workorder{doclinks{*}}},doclinks{*}&oslc.where=ticketid="${selectedTicketId}"`}
              hideCreateButton={readOnly}
            />
          </Tab>
        </Tabs>
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
    </>
  )
}

UpdateLayout.propTypes = {
  handleChange: PropTypes.func,
  handleSearchParams: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleSelectTicket: PropTypes.func,
  selectedTicketId: PropTypes.string,
  sr: serviceRequest,
  userPluspcustomer: PropTypes.string,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      message: PropTypes.string
    })
  ),
  reload: PropTypes.func.isRequired
}
