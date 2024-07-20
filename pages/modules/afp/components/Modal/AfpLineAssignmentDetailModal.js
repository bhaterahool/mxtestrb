import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from "carbon-components-react"
import { SubCon } from '../../../subcon-portal'

export const AfpLineAssignmentDetailModal = ({
    data,
    handleModalStatus
}) => {

    const modalProps = {
        size: 'lg',
        open: data.open,
        onRequestClose: () => {
            handleModalStatus({
                open: false,
                assignmentId: 0
            })
        },
        modalHeading: 'Assignment Details',
        passiveModal: true,
        className: 'assignment-detail__modal'
    }

    return (
        <Modal {...modalProps}>
            {data.assignmentId && <SubCon 
                showHeader={false}
                showSideNav={false} 
                loadAssignmentDetail={true}
                assignmentId={data.assignmentId}
            />}
        </Modal>
    )    
}

AfpLineAssignmentDetailModal.propTypes = {
    data: PropTypes.shape({open: PropTypes.bool, assignmentId: PropTypes.number}),
    handleModalStatus: PropTypes.func.isRequired
}