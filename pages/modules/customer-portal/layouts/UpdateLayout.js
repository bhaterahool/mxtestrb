import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { Tabs, Tab, Button } from 'carbon-components-react'
import {
  InfoPanel,
  EditPanel,
  DoclinksList,
  WorkLogs,
  ServiceRequestWorkOrders
} from '../components'
import { useObject } from '../../../shared/hooks/useObject'
import { addSchemaToEditorConfig } from '../../../shared/addSchemaToEditorConfig'


import { api } from '../../app/api'
import { useRegistry } from '../../../shared/RegistryProvider'
import { Loading } from '../../shared-components/Loading'


const editorConfig = new Map([
  [
    'ticketid',
    {
      readOnly: true
    }
  ],
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
  ['description', { readOnly: true }],
  ['pelclientref', { readOnly: true }],
  ['pluspcustponum', { readOnly: true }],
  ['reportedbyname', { readOnly: true }],
  ['reportedemail', { readOnly: true }],
  ['reportedphone', { readOnly: true }],
  [
    'origrecordid',
    {
      hidden: true
    }
  ],
  ['affectedusername', { readOnly: true }],
  ['affectedemail', { readOnly: true }],
  ['affectedphone', { readOnly: true }],
  [
    'pellocbuilding',
    {
      readOnly: true
    }
  ],
  ['location', { readOnly: true }],
  [
    'locadd',
    {
      readOnly: true
    }
  ],
  ['assetnum', { readOnly: true }],
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

  if (loading) return <Loading modal />

  if (BaseComponent === DoclinksList) {
    return <BaseComponent data={data} error={error} hideCreateButton="true" {...props} />
  }
  return (
    <BaseComponent
      data={data}
      error={error}
      hideCreateButton="true"
      forceClientViewable
      {...props}
    />
  )
}

const DoclinksWithFormObject = withFormObject(DoclinksList)
const WorkLogsWithFormObject = withFormObject(WorkLogs)

export const UpdateLayout = ({
  sr,
  reload,
  handleSearchParams,
  selectedTicketId,
  userPluspcustomer,
  busUnits,
  handleOpenReport,
  ...props
}) => {
  const methods = useForm()
  const [registry] = useRegistry()

  useEffect(() => {
    addSchemaToEditorConfig(registry.pelsrfullschema, editorConfig)
  }, [registry.pelsrfullschema])

  const getInputProps = name => ({
    id: name,
    name,
    ...editorConfig.get(name)
  })

  return (
    <>
      <FormProvider {...methods}>
        <Tabs>
          <Tab label="General Details">
            <section className="pel--container pel--has-footer-bar">
              <div className="bx--grid">
                <div className="bx--row">
                  <div className="bx--col-lg-8 bx--no-gutter">
                    <EditPanel
                      sr={sr}
                      getInputProps={getInputProps}
                      handleSearchParams={handleSearchParams}
                      userPluspcustomer={userPluspcustomer}
                      busUnits={busUnits}
                      loading={!sr}
                    />
                  </div>
                  <div className="bx--offset-lg-12 bx--col-lg-2">
                    <InfoPanel sr={sr} loading={!sr} />
                  </div>
                </div>
                <div className="bx--row">
                  <div className="bx--col-lg-8 bx--no-gutter">
                    {sr && <ServiceRequestWorkOrders sr={sr} reload={reload} />}
                  </div>
                </div>
              </div>
              <div className="bx--row pel--footer-bar">
                <Button onClick={handleOpenReport}>Download Pdf</Button>
              </div>
            </section>
          </Tab>
          <Tab label="Log Notes">
            <WorkLogsWithFormObject
              objectType="pelsrlogs"
              query={`oslc.select=ticketid,worklog{ worklogid,createdate,logtype,createby,clientviewable,recordkey,description,description_longdescription,logtype_description,person{displayname,primaryemail,primaryphone}}&oslc.where=ticketid="${selectedTicketId}"`}
              logTypes={registry.logTypes}
            />
          </Tab>
          <Tab label="Documents">
            <DoclinksWithFormObject
              objectType="pelsrdocs"
              query={`oslc.select=relatedrecord{*,workorder{doclinks{*}}},doclinks{*}&oslc.where=ticketid="${selectedTicketId}"`}
            />
          </Tab>
        </Tabs>
      </FormProvider>
    </>
  )
}

UpdateLayout.propTypes = {
  handleChange: PropTypes.func,
  handleSearchParams: PropTypes.func,
  selectedTicketId: PropTypes.string,
  sr: PropTypes.shape({
    ticketid: PropTypes.string.isRequired
  }),
  userPluspcustomer: PropTypes.string,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      message: PropTypes.string
    })
  ),
  reload: PropTypes.func.isRequired
}
