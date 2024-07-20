import React from 'react'
import { Form, Button, Checkbox } from 'carbon-components-react'
import Link16 from '@carbon/icons-react/lib/link/16'
import PropTypes from 'prop-types'
import { PelTextInput, PelTextArea, PelDateInput } from '../../../shared/forms/Inputs'
import { LongDescriptionModal } from '../../../shared/forms/LongDescriptionModal'


export const EditPanel = ({
  loading,
  getInputProps,
  handleSearchParams,
  pelbusunit,
  busUnits,
  sr
}) => {
  
  const handleShowRelated = ticketid => () =>
    handleSearchParams(params => ({
      ...params,
      queryParams: {
        savedQuery: '',
        where: `relatedticket.RELATEDRECKEY="${ticketid}"`
      }
    }))

  const getFormattedAddress = address => {
    if (!address) return ''

    let addr = `${address.description},`
    const newline = String.fromCharCode(13, 10)
    if (address.addressline2) addr += `${newline}${address.addressline2},`
    if (address.addressline3) addr += `${newline}${address.addressline3},`
    addr += `${newline}${address.city}, ${address.postalcode}`

    return addr
  }

  // if (!sr.pelpomand && sr?.pluspcustomer?.[0]?.pelpomand) {
  //   form.pelpomand = sr.pluspcustomer?.[0]?.pelpomand
  // }
  return (
    <>
      <Form>
        <div className="bx--row">
          <div className="bx--col-lg-6 flex bx--no-gutter">
            <div className="bx--col-lg-6">
              <PelTextInput
                {...getInputProps('ticketid')}
                defaultValue={sr?.ticketid}
                showSkeleton={loading}
                buttons={
                  !loading && [
                    <Button
                      key="findrelatedsr"
                      renderIcon={Link16}
                      kind="tertiary"
                      iconDescription="Find Related"
                      tooltipPosition="top"
                      hasIconOnly
                      size="small"
                      onClick={handleShowRelated(sr?.ticketid)}
                    />
                  ]
                }
              />
            </div>
            <div className="bx--col-lg-6">
              <PelDateInput
                {...getInputProps('reportdate')}
                date={sr?.reportdate}
                showSkeleton={loading}
                format="d-M-Y"
              />
            </div>
          </div>
          <div className="bx--col-lg-6">
            <PelTextInput
              {...getInputProps('description')}
              value={sr?.description}
              showSkeleton={loading}
              buttons={
                sr?.description_longdescription && (
                  <LongDescriptionModal longdescription={sr?.description_longdescription} />
                )
              }
            />
          </div>
        </div>

        <div className="bx--row">
          <div className="bx--col-lg-6">
            <PelTextInput
              {...getInputProps('pluspcustomer[0].customer')}
              value={sr?.pluspcustomer?.[0]?.customer}
              showSkeleton={loading}
              showDescription
              description={sr?.pluspcustomer?.[0]?.name}
            />

            <fieldset>
              <legend>Reported By</legend>
              <PelTextInput
                {...getInputProps('reportedbyname')}
                value={sr?.reportedbyname}
                showSkeleton={loading}
                labelText="Name"
              />

              <PelTextInput
                {...getInputProps('reportedemail')}
                value={sr?.reportedemail}
                showSkeleton={loading}
                labelText="E-Mail"
              />

              <PelTextInput
                {...getInputProps('reportedphone')}
                value={sr?.reportedphone}
                showSkeleton={loading}
                labelText="Phone"
              />
            </fieldset>

            <PelTextInput
              {...getInputProps('pellocbuilding')}
              value={sr?.pellocpclookup?.[0]?.building}
              showSkeleton={loading}
              showDescription
              description={sr?.pellocpclookup?.[0]?.builddesc}
            />
            <PelTextInput
              {...getInputProps('location')}
              value={sr?.locations?.[0]?.location}
              showSkeleton={loading}
              showDescription
              description={sr?.locations?.[0]?.description}
            />
          </div>
          <div className="bx--col-lg-6">
            <div className="bx--row">
              <div className="bx--col-lg-6">
                <PelTextInput
                  {...getInputProps('pelclientref')}
                  value={sr?.pelclientref}
                  showSkeleton={loading}
                />
              </div>
              <div className="bx--col-lg-6">
                <PelTextInput
                  {...getInputProps('pluspcustponum')}
                  value={sr?.pluspcustponum}
                  showSkeleton={loading}
                  labelText="Customer Authorisation (WO/PO)"
                />
              </div>
            </div>

            <fieldset>
              <legend>Affected Person</legend>
              <PelTextInput
                {...getInputProps('affectedusername')}
                value={sr?.affectedusername}
                showSkeleton={loading}
                labelText="Name"
              />

              <PelTextInput
                {...getInputProps('affectedemail')}
                value={sr?.affectedemail}
                showSkeleton={loading}
                labelText="E-Mail"
              />

              <PelTextInput
                {...getInputProps('affectedphone')}
                value={sr?.affectedphone}
                showSkeleton={loading}
                labelText="Phone"
              />
            </fieldset>

            <PelTextInput
              {...getInputProps('assetnum')}
              value={sr?.assetnum}
              showSkeleton={loading}
              showDescription="true"
              description={sr?.asset?.[0]?.description}
            />

            {!['CP', 'CC', 'IN'].includes(sr?.pelsrtype) && (
              <PelTextInput {...getInputProps('owner')} value={sr?.owner} showSkeleton={loading} />
            )}

            <PelTextArea
              {...getInputProps('locadd')}
              value={sr?.locadd || getFormattedAddress(sr?.tkserviceaddress?.[0])}
              showSkeleton={loading}
            />
            <div>
              <fieldset className="bx--fieldset">
                <Checkbox
                  labelText="Health and Safety"
                  id="pelreportashs"
                  name="pelreportashs"
                  checked={sr?.pelreportashs}
                  disabled
                />
                <Checkbox
                  labelText="Business Critical"
                  id="pelreportascrit"
                  name="pelreportascrit"
                  checked={sr?.pelreportascrit}
                  disabled
                />
              </fieldset>
            </div>
          </div>
        </div>
      </Form>
    </>
  )
}

EditPanel.propTypes = {
  busunit: PropTypes.string,
  personid: PropTypes.string,
  getInputProps: PropTypes.func,
  handleChange: PropTypes.func,
  handleSearchParams: PropTypes.func,
  handleCriteriaChange: PropTypes.func,
  loading: PropTypes.bool,
  sr: PropTypes.shape({
    pluspcustomer: PropTypes.arrayOf(
      PropTypes.shape({
        customer: PropTypes.string,
        name: PropTypes.string,
        pelpomand: PropTypes.bool
      })
    ),
    asset: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string
      })
    ),
    status: PropTypes.string,
    owner: PropTypes.string,
    ownergroup: PropTypes.string,
    affectedphone: PropTypes.number,
    reportedphone: PropTypes.number,
    pluspcustponum: PropTypes.number,
    locadd: PropTypes.string,
    affectedusername: PropTypes.string,
    reportedbyname: PropTypes.string,
    affectedemail: PropTypes.string,
    reportedemail: PropTypes.string,
    classstructure: PropTypes.arrayOf(
      PropTypes.shape({
        classstructureid: PropTypes.string
      })
    ),
    pelreportashs: PropTypes.string,
    pelclientref: PropTypes.string,
    pelreportascrit: PropTypes.string,
    description: PropTypes.string,
    description_longdescription: PropTypes.string,
    origrecordid: PropTypes.string,
    pelsrtype: PropTypes.string,
    pelsrsubtype: PropTypes.string,
    internalpriority: PropTypes.number,
    location: PropTypes.arrayOf(
      PropTypes.shape({
        location: PropTypes.string,
        description: PropTypes.string
      })
    ),
    locations: PropTypes.shape({}),
    pellocpclookup: PropTypes.arrayOf(
      PropTypes.shape({
        builddesc: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
        building: PropTypes.string
      })
    ),
    pellocbuilding: PropTypes.string,
    assetnum: PropTypes.string,
    reportdate: PropTypes.string,
    ticketspec: PropTypes.arrayOf(PropTypes.shape({})),
    href: PropTypes.string,
    ticketid: PropTypes.string,
    tkserviceaddress: PropTypes.shape({}),
    ticketuid: PropTypes.number,
    pelbusunit: PropTypes.string
  }),
  ticketId: PropTypes.string,
  pelbusunit: PropTypes.string,
  busUnits: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  ),
  userPluspcustomer: PropTypes.string
}
