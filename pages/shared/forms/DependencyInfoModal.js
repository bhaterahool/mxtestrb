import React from 'react'
import PropTypes from 'prop-types'
import Information16 from '@carbon/icons-react/lib/information/16'
import { PelTextInput } from '.'
import * as Helpers from '../../modules/subcon-portal/components/form/helpers'
import { PelModalWrapper } from '../../modules/contact-center/components/PelModalWrapper'

export const DependencyInfoModal = ({ dependencyinfo, ...props }) => {
  if (!dependencyinfo) {
    return null
  }

  const dependedData = dependencyinfo?.[0]
  const dependedAssignmentData = dependedData?.peldeplabor?.[0]?.pelassignment?.[0]

  const dependencyInfo = {
    peldependtype: dependedData?.peldependtype,
    peldependtype_description: dependedData?.peldependtype_description,
    peldependdesc: dependedData?.peldependdesc,
    peldependonid: dependedData?.peldependonid,
    peldependflag: dependedData?.peldependflag,
    peldependlag: dependedData?.peldependlag,
    assignmentid: dependedAssignmentData?.assignmentid,
    pelassignstart: dependedAssignmentData?.pelassignstart,
    pelassignfinish: dependedAssignmentData?.pelassignfinish,
    status_description: dependedAssignmentData?.pelassignstatus?.[0]?.description,
    status: dependedAssignmentData?.status,
    peldescription: dependedAssignmentData?.peldescription,
    laborcode: dependedAssignmentData?.laborcode,
    displayname: dependedAssignmentData?.uxlabor?.[0]?.displayname
  }

  const modalProps = {
    modalHeading: 'Dependency Information',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: true,
    renderTriggerButtonIcon: () => <Information16 />,
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    ...props
  }

  return (
    <PelModalWrapper {...modalProps}>
      <div className="pel--container bx--grid pel--worklogs pel-flex-column no-padding">
        <div className="bx--row">
          <div className="bx--col-lg-3 bx--col-md-3">
            <PelTextInput
              readOnly
              labelText="Dependency Description"
              value={dependencyInfo?.peldependdesc}
            />
            <PelTextInput
              readOnly
              labelText="Dependency Type"
              value={`${dependencyInfo?.peldependtype}: ${dependencyInfo?.peldependtype_description}`}
            />
            <PelTextInput
              readOnly
              labelText="Lead / Lag duration"
              value={dependencyInfo?.peldependlag}
            />
          </div>
          <div className="bx--col-lg-3 bx--col-md-3">
            <PelTextInput
              readOnly
              labelText="Dependent Assign. ID"
              value={dependencyInfo?.assignmentid}
            />
            <PelTextInput
              readOnly
              labelText="Dependent Assign. Status"
              value={`${dependencyInfo?.status}: ${dependencyInfo?.status_description}`}
            />
            <PelTextInput
              readOnly
              labelText="Dependent Assign. Description"
              value={dependencyInfo?.peldescription}
            />
          </div>
          <div className="bx--col-lg-3 bx--col-md-3">
            <PelTextInput
              readOnly
              labelText="Estimated Start"
              name="estimatedstart"
              value={Helpers.toShortDate(dependencyInfo?.pelassignstart || '')}
            />
            <PelTextInput
              readOnly
              labelText="Estimated Finish"
              name="estimatedfinish"
              value={Helpers.toShortDate(dependencyInfo?.pelassignfinish || '')}
            />
            <PelTextInput
              readOnly
              labelText="Dependent Assign. Labor Name"
              value={dependencyInfo?.displayname}
            />
          </div>
        </div>
      </div>
    </PelModalWrapper>
  )
}

DependencyInfoModal.propTypes = {
  dependencyinfo: PropTypes.arrayOf(PropTypes.object).isRequired
}
