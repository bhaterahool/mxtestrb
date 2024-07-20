import { useState, useEffect } from 'react'
import _ from 'lodash'
import { usePrevious } from '../../../shared/hooks/usePrevious'
import { useServiceRequestSearchProvider } from '../search/SearchProvider'
import config from '../../app/config'

export const defaultValues = {
  ticketuid: '',
  ticketspec: [],
  locadd: '',
  pelbusunit: '',
  pelclientref: '',
  pluspcustponum: '',
  classstructureid: '',
  classstructurename: '',
  description: '',
  pelsrtype: 'RW',
  pelsrsubtype: '',
  description_longdescription: '',
  ticketid: '',
  location: '',
  locationDesc: '',
  pellocbuilding: '',
  buildingDesc: '',
  pluspcustomer: '',
  assetnum: '',
  assetDesc: '',
  reportedby: '',
  reportedbyname: '',
  reportedphone: '',
  reportedemail: '',
  affectedperson: '',
  affectedusername: '',
  affectedphone: '',
  affectedemail: '',
  origrecordid: '',
  origrecordclass: '',
  origrecordDesc: '',
  internalpriority: '',
  pelprioritychangedesc: '',
  siteid: '',
  assetsiteid: '',
  originalSR: '',
  ownergroup: '',
  ownergroupDesc: '',
  owner: '',
  ownerDesc: '',
  pelreportascrit: false,
  pelreportashs: false,
  pelpomand: false,
  status: '',
  mitcapersonid: '',
  mitcateam: '',
  mitcostcode: '',
  mitccdesc: '',
  mitcadesc: '',
  mitiscareq: false,
  mitisccreq: false,
  mitcastatus: '',
  mitcareason: '',
  mitcarearej: '',
  /* OBJECT WILL HOLD THE TYPEAHEAD SELECTED OBJECT */
  /* DON'T FORGET TO DELETE THIS KEY FROM "form" OBJECT */
  selected: {},
  skipprioritycalculation: false
}

const useFormSpy = (form, onChange) => {
  const previous = usePrevious(form)

  useEffect(() => {
    if (previous !== undefined && !_.isEqualWith(form, previous)) {
      onChange(form)
    }
  }, [form])
}

export const useFormModel = (initialValues, onChange) => {
  const formInitialValues = {
    ...initialValues,
    selected: {
      ...(initialValues?.pellocpclookup?.[0]?.building && {
        pellocbuilding: {
          ...initialValues.pellocpclookup,
          isSelected: true
        }
      })
    }
  }

  const [form, setForm] = useState({
    ...defaultValues,
    ...formInitialValues
  })

  const [originaldata, setOriginaldata] = useState({
    ...defaultValues,
    ...formInitialValues
  })

  const fromMaximoActData = sr => {
    setOriginaldata({
      ...originaldata,
      building: '',
      ..._.pick(sr, _.keys(defaultValues))
    })
  }

  const { doFormSearch } = useServiceRequestSearchProvider()

  /**
   * Watch for changes in the model and use callback with values.
   *
   * Fall back to noop so I don't have to specify it in all of the tests.
   */
  useFormSpy(form, onChange || _.noop)

  const getCustomerFromContact = pluspcustcontact => {
    if (pluspcustcontact?.[0]?.pluspcustomer && pluspcustcontact?.length === 1) {
      const [
        {
          customer,
          pluspcustomer: [{ name, pelknownascust }]
        }
      ] = pluspcustcontact

      return [
        {
          name,
          customer,
          pelknownascust
        }
      ]
    }
    return [
      {
        name: '',
        customer: '',
        pelknownascust: form?.pluspcustomer?.[0]?.pelknownascust
          ? pluspcustcontact?.filter(
              cust =>
                cust?.pluspcustomer?.[0]?.pelknownascust ===
                form?.pluspcustomer?.[0]?.pelknownascust
            )?.[0]?.pluspcustomer?.[0]?.pelknownascust
          : ''
      }
    ]
  }

  /**
   * Use this method to prime the model with data once it's loaded.
   */
  const fromMaximo = sr =>
    setForm({
      ...form,
      ..._.pick(sr, _.keys(defaultValues))
    })

    const setFormValue = (name, value) =>
    setForm(form => ({
      ...form,
      [name]: value
    }))

    const setCustomer = data => {
    const pluspcustomer = data
      ? [
          {
            customer: data.customer,
            name: data.name,
            pelknownascust: data.pelknownascust
          }
        ]
      : ''
    // if customer being set is not relevant for current reportedby person, then we need to clear the form
    const clearPersonData =
      data.customer &&
      !form?.selected?.reportedby?.pluspcustcontact?.some(
        ({ customer = '' }) => customer === data.customer
      )

    setForm(form => ({
      ...form,
      location: '',
      locationDesc: '',
      pellocbuilding: '',
      buildingDesc: '',
      assetnum: '',
      assetDesc: '',
      reportedby: clearPersonData ? '' : form.reportedby,
      reportedbyname: clearPersonData ? '' : form.reportedbyname,
      reportedphone: clearPersonData ? '' : form.reportedphone,
      reportedemail: clearPersonData ? '' : form.reportedemail,
      affectedperson: '',
      affectedusername: '',
      affectedphone: '',
      affectedemail: '',
      origrecordid: '',
      origrecordclass: '',
      pluspcustomer,
      siteid: '',
      pluspcustponum: ''
    }))

    doFormSearch(form, { pluspcustomer: pluspcustomer?.[0]?.customer })
  }

  const setEndCustomer = data => {
    // if end customer being set is not relevant for current reportedby person, then we need to clear the form
    const hasKnownCustomerChanged = form.pluspcustomer?.[0]?.pelknownascust
      ? form.pluspcustomer?.[0]?.pelknownascust !== data.pelknownascust
      : false

    const clearPersonData = hasKnownCustomerChanged

    const pluspcustomer = [
      {
        name: form.pluspcustomer?.[0]?.name || '',
        customer: form.pluspcustomer?.[0]?.customer || '',
        pelknownascust: data?.pelknownascust || ''
      }
    ]

    if (form.pluspcustomer?.[0]?.pelknownascust !== data?.pelknownascust) {
      pluspcustomer[0].name = data?.name || ''
      pluspcustomer[0].customer = data?.customer || ''
    }

    let clearReportedByData = false

    if (data?.pelknownascust && !clearPersonData) {
      const isPersonNotAssociated =
        form?.selected?.reportedby &&
        form?.selected?.reportedby?.pluspcustcontact?.some(
          cl => cl?.pluspcustomer?.[0]?.pelknownascust === data?.pelknownascust
        )

      if (!isPersonNotAssociated) {
        clearReportedByData = true
      }
    }

    setForm(form => ({
      ...form,
      location: clearPersonData ? '' : form.location,
      locationDesc: clearPersonData ? '' : form.locationDesc,
      pellocbuilding: clearPersonData ? '' : form.pellocbuilding,
      buildingDesc: clearPersonData ? '' : form.buildingDesc,
      assetnum: clearPersonData ? '' : form.assetnum,
      assetDesc: clearPersonData ? '' : form.assetDesc,
      reportedby: clearPersonData || clearReportedByData ? '' : form.reportedby,
      reportedbyname: clearPersonData || clearReportedByData ? '' : form.reportedbyname,
      reportedphone: clearPersonData || clearReportedByData ? '' : form.reportedphone,
      reportedemail: clearPersonData || clearReportedByData ? '' : form.reportedemail,
      affectedperson: clearPersonData ? '' : form.affectedperson,
      affectedusername: clearPersonData ? '' : form.affectedusername,
      affectedphone: clearPersonData ? '' : form.affectedphone,
      affectedemail: clearPersonData ? '' : form.affectedemail,
      origrecordid: clearPersonData ? '' : form.origrecordid,
      origrecordclass: clearPersonData ? '' : form.origrecordclass,
      pluspcustomer,
      siteid: clearPersonData ? '' : form.siteid,
      pluspcustponum: clearPersonData ? '' : form.pluspcustponum
    }))

    doFormSearch(form, { pluspcustomer: pluspcustomer?.[0]?.pelknownascust })
  }

  /**
   * Set reportedby.
   * TODO: Set customer name once it's available in data.
   */
  const setReportedBy = data => {
    const {
      pluspcustcontact,
      personid: reportedby,
      primaryemail: reportedemail,
      primaryphone: reportedphone,
      displayname: reportedbyname
    } = data
    const pluspcustomer = getCustomerFromContact(pluspcustcontact)

    setForm(form => ({
      ...form,
      selected: {
        reportedby: data,
        ...(data?.pellocpclookup?.building && {
          pellocbuilding: {
            ...data.pellocpclookup,
            isSelected: true
          }
        })
      },
      reportedby,
      pluspcustomer,
      reportedemail,
      reportedphone,
      reportedbyname,
      ...(!form.pellocbuilding &&
        data.pellocpclookup && {
          pellocbuilding: data.pellocpclookup.building,
          buildingDesc: data.pellocpclookup.builddesc,
          location: data.pellocpclookup.building,
          locationDesc: data.pellocpclookup.builddesc,
          siteid: data.siteid
        })
    }))
    doFormSearch(form, {
      ...(data.pellocpclookup && { pellocbuilding: data.pellocpclookup.building }),
      pluspcustomer:
        form?.pluspcustomer?.length > 0
          ? form?.pluspcustomer?.[0]?.customer
          : pluspcustomer?.[0]?.customer
    })
  }

    const setReportedByName = reportedbyname =>
    setForm(form => ({
      ...form,
      reportedbyname,
      reportedby: '',
      ...(reportedbyname === '' && {
        reportedemail: '',
        reportedphone: '',
        ...(!form.origrecordid && {
          location: '',
          locationDesc: '',
          pellocbuilding: '',
          buildingDesc: ''
        })
      })
    }))

  const setClassification = classification =>
    setForm(form => ({
      ...form,
      classstructurename: classification?.description,
      classstructureid: classification?.classstructureid
    }))

  /**
   * Set the selected building and if available, pluspcustomer as well.
   */
  const setBuilding = data => {
    const lookup = _.get(data, 'pellocpclookup', {
      building: '',
      builddesc: ''
    })

    let clearReportedBy = false

    const selectedReportedBy = form?.selected?.reportedby

    if (form?.reportedby && form?.selected?.reportedby && data?.pellocpclookup?.isSelected) {
      const isCustomerAssociatedWithReportedByPerson = selectedReportedBy?.pluspcustcontact?.some(
        row => row?.customer === data?.pluspprimarycust?.customer
      )

      clearReportedBy = !isCustomerAssociatedWithReportedByPerson
    }

    setForm(form => ({
      ...form,
      selected: {
        ...form.selected,
        pellocbuilding: {
          isSelected: data?.pellocpclookup?.isSelected ?? true,
          ...data
        },
        ...(clearReportedBy && {
          reportedby: {}
        })
      },
      reportedby: clearReportedBy ? '' : form.reportedby,
      reportedbyname: clearReportedBy ? '' : form.reportedbyname,
      reportedphone: clearReportedBy ? '' : form.reportedphone,
      reportedemail: clearReportedBy ? '' : form.reportedemail,
      siteid: data?.siteid,
      pellocbuilding: lookup.building || data.location,
      buildingDesc: lookup.builddesc || data.description,
      location: lookup.building || data.location,
      locationDesc: lookup.builddesc || data.description,
      ...(data.pluspprimarycust && {
        pluspcustomer: [
          {
            customer: data.pluspprimarycust.customer,
            name: data.pluspprimarycust.name,
            pelknownascust: data.pluspprimarycust.pelknownascust
          }
        ]
      })
    }))

    if (lookup?.building?.length >= config.search.minSearchLength) {
      doFormSearch(form, {
        pellocbuilding: lookup.building,
        ...(data?.pluspprimarycust && { pluspcustomer: data?.pluspprimarycust?.customer })
      })
    }
  }

  /**
   * Set the selected location.
   *
   * If a building is found then set that as well from pellocpclookup
   */
  const setLocation = data => {
    const { location, description } = {
      location: '',
      description: '',
      ...data
    }

    setForm(form => ({
      ...form,
      location,
      siteid: data?.siteid,
      locationDesc: description,
      selected: {
        ...form.selected,
        ...((data?.pellocpclookup || data?.location) && {
          pellocbuilding: {
            ...form.selected?.pellocbuilding,
            isSelected: true
          }
        })
      },
      ...(data.pellocpclookup && {
        pellocbuilding: data.pellocpclookup.building || data.location,
        buildingDesc: data.pellocpclookup.builddesc || data.description
      }),
      ...(data?.pelchildloc && data.pelchildloc.siteid && { siteid: data.pelchildloc.siteid }),
      ...(data.pluspprimarycust && {
        pluspcustomer: [
          {
            customer: data.pluspprimarycust.customer,
            name: data.pluspprimarycust.name,
            pelknownascust: data.pluspprimarycust.pelknownascust
          }
        ]
      })
    }))

    doFormSearch(form, { location })
  }

  /**
   * Set the selected asset.
   * Assets are scoped to location and within the ui they cannot be selected without there first
   * being a selected location.
   */
  const setAsset = ({ assetnum, description }) =>
    setForm(form => ({
      ...form,
      assetnum,
      assetDesc: description
    }))

  const setOwnerGroup = ({ persongroup, description }) =>
    setForm(form => ({
      ...form,
      ownergroup: persongroup,
      ownergroupDesc: description
    }))

  const setOwner = ({ personid, displayname }) =>
    setForm(form => ({
      ...form,
      owner: personid,
      ownerDesc: displayname
    }))

  const setSiteID = siteid =>
    setForm(form => ({
      ...form,
      siteid,
      assetsiteid: siteid
    }))

  const setCostCode = ({ mitcostcode, description }) =>
    setForm(form => ({
      ...form,
      mitcostcode,
      mitccdesc: description
    }))

  const setClientApprover = ({ mitcaperson, mitdisplayname }) =>
    setForm(form => ({
      ...form,
      mitcapersonid: mitcaperson,
      mitcadesc: mitdisplayname
    }))

  /**
   * Set affectedBy. Identical to reportedby so there's room to consolidate these two methods.
   * TODO: Set customer name once it's available in data.
   */
  const setAffectedBy = ({
    pluspcustcontact,
    personid: affectedperson,
    primaryemail: affectedemail,
    primaryphone: affectedphone,
    displayname: affectedusername
  }) => {
    const pluspcustomer = getCustomerFromContact(pluspcustcontact)

    setForm(form => ({
      ...form,
      affectedperson,
      ...(!!pluspcustomer?.[0]?.name && !!pluspcustomer?.[0]?.pelknownascust && { pluspcustomer }),
      affectedemail,
      affectedphone,
      affectedusername
    }))
  }

    const setAffectedUsername = affectedusername =>
    setForm(form => ({
      ...form,
      affectedusername,
      affectedperson: '',
      ...(affectedusername === '' && {
        affectedemail: '',
        affectedphone: ''
      })
    }))

  /**
   * Set the originating SR ref and keep tabs on the actual SR.
   */
  const setOrigRecord = data => {
    setForm(form => ({
      ...form,
      selected: {
        ...form.selected,
        ...(data?.pellocpclookup?.[0]?.building && {
          pellocbuilding: {
            ...data.pellocpclookup,
            isSelected: true
          }
        })
      },
      origrecordid: data.ticketid,
      origrecordclass: 'SR',
      pelsrsubtype: data.pelsrtype === 'CH' ? 'PROGRESS' : '',
      ...(data.pluspcustomer && {
        pluspcustomer: [data.pluspcustomer]
      }),
      origrecordDesc: data.description,
      ...(data.location && {
        location: data.location,
        locationDesc: data?.locations?.description,
        siteid: data?.locations?.siteid
      }),
      ...{
        pellocbuilding: data?.pellocpclookup?.[0]?.building || data?.location,
        buildingDesc: data?.pellocpclookup?.[0]?.builddesc || data?.locations?.description
      },
      ...(data.pluspcustponum && {
        pluspcustponum: data.pluspcustponum
      }),
      ...(data.pelbusunit && {
        pelbusunit: data.pelbusunit
      }),
      ...(data.assetnum && {
        assetnum: data.asset[0].assetnum,
        assetDesc: data.asset[0].description
      }),
      ...(data.pelsrtype && {
        pelsrtype: data.pelsrtype
      }),
      ...(data.ticketspec && {
        ticketspec: data.ticketspec
      }),
      ...(data.classstructure && {
        classstructureid: data.classstructure[0].classstructureid,
        classstructurename: data.classstructure[0].description_class
      })
    }))
    if (data.ticketid) {
      doFormSearch(form, {
        TICKETID: data.ticketid,
        DESCRIPTION: data.description
      })
    }
  }

  const getFormValues = () => _.pick(form, _.keys(defaultValues))

  return {
    form,
    originaldata,
    fromMaximo,
    fromMaximoActData,
    setCustomer,
    setReportedBy,
    setReportedByName,
    setBuilding,
    setLocation,
    setAsset,
    setAffectedBy,
    setAffectedUsername,
    setFormValue,
    setOrigRecord,
    getFormValues,
    setSiteID,
    setOwner,
    setOwnerGroup,
    setCostCode,
    setClientApprover,
    setClassification,
    setEndCustomer
  }
}
