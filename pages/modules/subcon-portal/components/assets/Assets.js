import React, { useState, useEffect } from 'react'
import { Button } from 'carbon-components-react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { format } from 'date-fns'
import { api } from '../../../app/api'
import { useRegistry } from '../../../../shared/RegistryProvider'
import { AssetTable } from './AssetTable'
import { AssetForm } from './AssetForm'
import * as Props from './props'
import { updateAssignment } from '../../state/actions'
import { useSession } from '../../../auth/SessionProvider'
import { assignment } from '../form/props/assignment'

const getServerDateTime = () =>
  api.get(`/maximo/oslc/script/PELGETMXTIME`, {
    baseURL: `/`,
    removeparams: true
  })

export const Assets = ({ hideCreateButton, assignment, onSubmit, setIsFormDirty, refresh }) => {
  const [{ workOutcomes, pelAssetConds, prioritiesList, nonCompletionReasons }] = useRegistry()
  const [selectedAsset, setSelectedAsset] = useState(assignment?.workorder?.multiassetlocci?.[0])
  const dispatch = useDispatch()
  const [session] = useSession()

  const [form, setForm] = useState({
    multiid: '',
    assetnum: '',
    pelworkcomp: false,
    pelnoncompreason: '',
    pelworkoutcome: '',
    pelcompdate: '',
    pelcompnotes: '',
    newreading: '',
    pelcompby: ''
  })

  const rows =
    assignment?.workorder?.multiassetlocci?.map(
      ({
        sequence,
        asset,
        locations,
        pelworkoutcome,
        pelworkcomp,
        pelnoncompreason,
        pelcompby,
        multiid,
        assetnum
      }) => {
        const pelWorkout = workOutcomes.find(wo => wo.value === pelworkoutcome)
        const pelNonCompreason = nonCompletionReasons.find(ncr => ncr.value === pelnoncompreason)
        return {
          sequence,
          id: multiid,
          description: asset?.[0].description,
          location: locations?.[0].description,
          pelworkcomp,
          pelworkoutcome: pelWorkout
            ? `${pelWorkout?.value}: ${pelWorkout?.description}`
            : pelworkoutcome,
          pelnoncompreason: pelNonCompreason
            ? `${pelNonCompreason?.value}: ${pelNonCompreason?.description}`
            : pelnoncompreason,
          assetdetails: asset?.[0],
          pelcompby,
          assetnum,
          assettag: asset?.[0]?.assettag
        }
      }
    ) || []

  useEffect(() => {
    setForm({
      ...selectedAsset,
      newreading: selectedAsset?.asset?.[0]?.assetmeter?.[0]?.newreading ?? ''
    })
  }, [selectedAsset, refresh])

  useEffect(() => {
    setSelectedAsset(assignment?.workorder?.multiassetlocci?.[0])
  }, [assignment.assignmentid])

  const handleAssetSelect = row => {
    const asset = assignment?.workorder?.multiassetlocci.find(record => record.multiid === row.id)
    setSelectedAsset(asset)
  }

  const handleFormReset = () => {
    setForm(form => ({
      ...form,
      newreading: '',
      pelworkoutcome: '',
      pelcompnotes: '',
      pelcompdate: '',
      pelnoncompreason: ''
    }))
  }

  const handleChange = async e => {
    const {
      target: { name, value }
    } = e

    const multiasset = {
      ...form,
      pelcompby: session?.personid,
      edited: true,
      [name]: value
    }

    const formUpdate = {
      ...form,
      edited: true,
      [name]: value
    }

    setIsFormDirty(true)

    if (name === 'pelworkcomp' && !value) {
      handleFormReset()
      formUpdate.pelworkoutcome = ''
    } else if (name === 'pelworkcomp' && value) {
      formUpdate.pelnoncompreason = ''
      formUpdate.pelcompdate = new Date()
      multiasset.pelnoncompreason = ''
      const res = await getServerDateTime().catch(err => {
        throw new Error(`Cound not retrieve Server date time. Reason: ${err.message}`)
      })
      if (res && res.status === 200) {
        if (format(new Date(formUpdate.pelcompdate), 'dd') === format(new Date(), 'dd')) {
          formUpdate.pelcompdate = res.data.mxtime
        }
      }
    }

    
    setForm(() => formUpdate)

    

    if (name === 'newreading' || form.newreading) {
      
      multiasset.asset = [
        {
          ...selectedAsset.asset?.[0],
          assetmeter: [
            {
              ...selectedAsset.asset?.[0]?.assetmeter?.[0],
              newreading: name === 'newreading' ? value : form.newreading,
              newreadingdate: name === 'newreading' ? new Date() : form.newreadingdate,
              inspector: session?.personid
            }
          ]
        }
      ]
    }

    
    const updatedAssignment = {
      ...assignment,
      workorder: [
        {
          ...assignment.workorder,
          multiassetlocci: assignment?.workorder?.multiassetlocci?.map(mal =>
            mal.multiid === form.multiid ? multiasset : mal
          )
        }
      ]
    }
    dispatch(updateAssignment(updatedAssignment))
  }

  const hasAssetEdits = assignment => {
    return assignment?.workorder?.multiassetlocci?.some(mal => mal.edited) ?? false
  }

  const handleSubmit = e => {
    e.preventDefault()

    
    const updated = {
      href: assignment.href,
      workorder: [
        {
          href: assignment.workorder.href,
          multiassetlocci: assignment.workorder.multiassetlocci
            .filter(
              mal =>
                (mal.edited && mal.pelworkcomp && mal.pelcompnotes) ||
                (mal.edited && !mal.pelworkcomp) ||
                (mal.edited && mal.pelworkoutcome === 'SATISFACTORY')
            )
            .map(mal => {
              const { edited, locations, asset, _rowstamp, ...multiasset } = mal

              const assetmeter = mal.asset?.[0].assetmeter?.[0]

              return {
                ...multiasset,
                
                ...(assetmeter?.newreading && {
                  asset: [
                    {
                      href: mal.asset[0].href,
                      assetmeter: [
                        {
                          href: assetmeter.href,
                          newreading: assetmeter.newreading,
                          newreadingdate: assetmeter.newreadingdate,
                          inspector: assetmeter.inspector
                        }
                      ]
                    }
                  ]
                })
              }
            })
        }
      ]
    }
    return onSubmit(updated)
  }

  const workOutcomeMandatory = form?.pelworkcomp && form?.pelworkoutcome === ''

  const completionNotesMandatory =
    form?.pelworkcomp && !form?.pelcompnotes && form?.pelworkoutcome !== 'SATISFACTORY'

  const multiAssetLocciData = assignment?.workorder?.multiassetlocci

  const isSaveButtonEnabled =
    multiAssetLocciData?.length > 0 &&
    multiAssetLocciData?.some(({ pelworkoutcome, pelcompnotes, pelworkcomp, pelnoncompreason }) => {
      if (pelworkcomp && pelworkoutcome && pelworkoutcome !== 'SATISFACTORY' && pelcompnotes) {
        return true
      }
      if (pelworkcomp && pelworkoutcome && pelworkoutcome === 'SATISFACTORY') {
        return true
      }
      if (!pelworkcomp && pelnoncompreason?.length) {
        return true
      }
    })

  return (
    <div className="bx--row">
      <div className="bx--col-lg-8 subcon-asset-table-wrapper">
        <AssetTable
          rows={rows}
          handleAssetSelect={handleAssetSelect}
          selectedMultiID={selectedAsset?.multiid}
          nonCompletionReasons={nonCompletionReasons}
        />
      </div>
      {selectedAsset && (
        <>
          <div className="bx--col-lg-4">
            <AssetForm
              multiassetlocci={form}
              assignment={assignment}
              workOutcomes={workOutcomes}
              pelAssetConds={pelAssetConds}
              prioritiesList={prioritiesList}
              nonCompletionReasons={nonCompletionReasons}
              hideCreateButton={
                hideCreateButton || (selectedAsset?.pelworkcomp && !selectedAsset.edited)
              }
              handleChange={handleChange}
              workOutcomeMandatory={workOutcomeMandatory}
              completionNotesMandatory={completionNotesMandatory}
            />
          </div>
          {!hideCreateButton && hasAssetEdits(assignment) && (
            <div className="bx--row pel--footer-bar">
              <Button onClick={handleSubmit} disabled={!isSaveButtonEnabled}>
                Save Assets
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

Assets.propTypes = {
  setIsFormDirty: PropTypes.func,
  onSubmit: PropTypes.func,
  assignment,
  multiassetlocci: Props.multiassetlocci,
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  hideCreateButton: PropTypes.bool.isRequired
}
