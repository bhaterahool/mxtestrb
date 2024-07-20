import React from 'react'
import PropTypes from 'prop-types'
import { PelTextInput, PelDateInput } from '../../../shared/forms/Inputs'
import { SLARecordModal } from './SLARecordModal'
import { ServiceRequestTypes } from '../../contact-center/constants'
import { useRegistry } from '../../../shared/RegistryProvider'

export const InfoPanel = ({ loading, sr }) => {
  const [registry] = useRegistry()
  const subtype =
    sr?.pelsrsubtype && registry?.srSubType?.find(st => st.value === sr.pelsrsubtype)?.description

  return (
    <div className="bx--form">
      <PelTextInput
        id="pelsrtype"
        name="pelsrtype"
        labelText="Type"
        readOnly
        showSkeleton={loading}
        defaultValue={ServiceRequestTypes[sr?.pelsrtype] ?? sr?.pelsrtype}
      />
      {subtype && ['CH', 'IN'].includes(sr?.pelsrtype) && (
        <PelTextInput
          id="pelsrsubtype"
          name="pelsrsubtype"
          labelText="Reason"
          readOnly
          showSkeleton={loading}
          defaultValue={subtype}
        />
      )}
      <PelTextInput
        id="status"
        name="status"
        labelText="Status"
        readOnly
        value={sr?.status_description}
        showSkeleton={loading}
      />
      <PelTextInput
        id="classification"
        name="classification"
        labelText="Classification"
        readOnly
        defaultValue={sr?.classstructure?.[0].description_class}
        showSkeleton={loading}
      />
      <PelTextInput
        id="internalpriority"
        name="internalpriority"
        labelText="Priority"
        readOnly
        defaultValue={sr?.internalpriority_description}
        showSkeleton={loading}
        buttons={!loading && <SLARecordModal ticketuid={sr?.ticketuid} />}
      />
      <PelDateInput
        readOnly
        id="targetstart"
        name="targetstart"
        labelText="Target Start"
        format="d-M-Y"
        date={sr?.targetstart}
        showSkeleton={loading}
      />
      <PelDateInput
        readOnly
        id="targetfinish"
        name="targetfinish"
        labelText="Target Finish"
        format="d-M-Y"
        date={sr?.targetfinish}
        showSkeleton={loading}
      />
    </div>
  )
}

InfoPanel.propTypes = {}
