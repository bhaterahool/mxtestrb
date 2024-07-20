import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Tile } from 'carbon-components-react'
import { PelTextInput, PelTextArea } from '../../../shared/forms/Inputs'
import { useRegistry } from '../../../shared/RegistryProvider'
import { ServiceRequestTypes } from '../constants'
import { serviceRequest } from '../props/serviceRequest'

export const ReviewPanel = ({ sr, getInputProps }) => {
  const [{ classifications }] = useRegistry()

  const getClassification = id => classifications?.find(cls => cls.classstructureid === id)

  const classification = useMemo(() => getClassification(sr?.classstructureid), [
    sr?.classstructureid
  ])

  return (
    <>
      <div className="pel--sr-review-panel card card-1">
        <div className="title-side">
          <h4>Service Request</h4>
        </div>
        <Tile className="sr-review-card">
          <div className="sr-review-field-wrapper">
            <PelTextInput
              {...getInputProps('pelsrtype')}
              value={ServiceRequestTypes[sr?.pelsrtype] || sr?.pelsrtype || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('classstructureid')}
              value={classification?.description || sr?.classstructureid || ''}
              readOnly
            />
            <PelTextArea
              {...getInputProps('description')}
              wrapperClassName="flex-1"
              className="no-border pel--textarea-padding"
              value={sr?.description || ''}
              readOnly
            />
          </div>
        </Tile>
      </div>
      <div className="pel--sr-review-panel card card-1">
        <div className="title-side">
          <h4>Customer</h4>
        </div>
        <Tile className="sr-review-card">
          <div className="sr-review-field-wrapper">
            <div className="pel--review-container">
              <label className="bx--label" htmlFor="customer">
                Customer
              </label>
              <p>{sr?.pluspcustomer?.[0]?.name}</p>
            </div>

            <PelTextInput
              {...getInputProps('pluspcustponum')}
              value={sr?.pluspcustponum || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('pelreportashs')}
              value={sr?.pelreportashs || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('pelreportascrit')}
              value={sr?.pelreportascrit || ''}
              readOnly
            />
          </div>
        </Tile>
      </div>
      <div className="pel--sr-review-panel card card-1">
        <div className="title-side">
          <h4>Reported By</h4>
        </div>
        <Tile className="sr-review-card">
          <div className="sr-review-field-wrapper">
            <PelTextInput
              {...getInputProps('reportedbyname')}
              value={sr?.reportedbyname || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('reportedphone')}
              value={sr?.reportedphone || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('reportedemail')}
              value={sr?.reportedemail || ''}
              wrapperClassName="flex-1"
              readOnly
            />
          </div>
        </Tile>
      </div>
      <div className="pel--sr-review-panel card card-1">
        <div className="title-side">
          <h4>Affected Person</h4>
        </div>
        <Tile className="sr-review-card">
          <div className="sr-review-field-wrapper">
            <PelTextInput
              {...getInputProps('affectedusername')}
              value={sr?.affectedusername || sr?.reportedbyname || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('affectedphone')}
              value={sr?.affectedphone || sr?.reportedphone || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('affectedemail')}
              wrapperClassName="flex-1"
              value={sr?.affectedemail || sr?.reportedemail || ''}
              readOnly
            />
          </div>
        </Tile>
      </div>
      <div className="pel--sr-review-panel card card-1">
        <div className="title-side">
          <h4>Additional Info</h4>
        </div>
        <Tile className="sr-review-card">
          <div className="sr-review-field-wrapper">
            <PelTextInput
              {...getInputProps('origrecordid')}
              value={sr?.origrecordid || ''}
              readOnly
            />
            <PelTextInput
              {...getInputProps('pellocbuilding')}
              value={sr?.buildingDesc || sr?.pellocpclookup?.[0]?.builddesc || ''}
              wrapperClassName="flex-1"
              readOnly
            />
            <PelTextInput
              {...getInputProps('location')}
              value={sr?.locationDesc || sr?.buildingDesc || sr?.locations?.[0]?.description || ''}
              wrapperClassName="flex-1"
              readOnly
            />
            <PelTextInput
              {...getInputProps('assetnum')}
              value={sr?.assetDesc || sr?.assetnum || sr?.asset?.[0]?.description || ''}
              readOnly
            />
          </div>
        </Tile>
      </div>
    </>
  )
}

ReviewPanel.propTypes = {
  srReview: PropTypes.shape({}),
  getInputProps: PropTypes.func,
  sr: serviceRequest
}
