import React, { useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Modal, Form, TextInput } from 'carbon-components-react'
import { api } from '../../app/api'
import { useToast } from '../../../shared/toasts/ToastProvider'
import getRelativePath from '../../../util/getRelativePath'
import { PelTextInput } from '../../../shared/forms/Inputs'

const hasError = () => {}

export const CreatePersonModal = ({ open, onRequestClose, pluspcustomer, pelbusunit }) => {
  const [, setState] = useState({ pending: false, error: null })

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    addressline1: '',
    stateprovince: '',
    postalcode: '',
    primaryphone: '',
    primaryemail: '',
    city: ''
  })

  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const [num, setNum] = useState(form.primaryphone)

  /**
   * Computed 'displayname' for person.
   */
  const getDisplayName = data => `${data.firstname} ${data.lastname}`

    const handleSubmit = async e => {
    e.preventDefault()

    
    e.stopPropagation()

    setState({ pending: true, error: null })

    
    Object.entries(form).forEach(([key, value]) => (form[key] = value.trim()))

    try {
      const res = await api.post(
        '/pelos/PELPERSON',
        {
          ...form,
          pluspcustvendor: pluspcustomer?.[0]?.customer,
          pluspcustvndtype: 'CUSTOMER',
          displayname: getDisplayName(form),
          pelbusunit
        },
        {
          headers: {
            properties: '*'
          }
        }
      )

      
      if (pluspcustomer) {
        
        
        const { data } = await api.get(
          `/pelos/pelcustomer?oslc.where=customer="${pluspcustomer?.[0]?.customer}"`
        )

        await api.post(
          getRelativePath(data.member[0].href),
          {
            customer: pluspcustomer?.[0]?.customer,
            pluspcustcontact: [
              {
                type: 'MAINT',
                personid: res.data.personid,
                _action: 'Add'
              }
            ]
          },
          {
            headers: {
              'x-method-override': 'PATCH',
              patchtype: 'MERGE'
            }
          }
        )
      }

      setState({ pending: false, error: null })

      setForm({
        firstname: '',
        lastname: '',
        addressline1: '',
        stateprovince: '',
        postalcode: '',
        primaryphone: '',
        primaryemail: '',
        city: ''
      })
      setNum('')

      addSuccessToast({
        subtitle: 'New person created'
      })

      const { personid, displayname, primaryemail, primaryphone } = res.data

      const pluspcustcontact = pluspcustomer
        ? [
            {
              customer: pluspcustomer[0].customer,
              pluspcustomer
            }
          ]
        : undefined

      return onRequestClose({
        personid,
        displayname,
        primaryemail,
        primaryphone,
        pluspcustcontact
      })
    } catch (err) {
      const message = _.get(err, 'response.data.Error.message', err.message)

      addPersistentErrorToast({
        subtitle: 'Failed to create new person',
        caption: message
      })

      setState({ pending: false, error: message })
    }
  }

    const handleChange = e => {
    const { name, value } = e.target

    const number = value.match(/^\+|\d*/g).join('')

    if (name === 'primaryphone') {
      setNum(number)
    }

    setForm(currentForm => ({
      ...currentForm,
      [name]: name === 'primaryphone' ? number : value
    }))
  }

  const mandatoryCheck = !form.primaryphone && !form.primaryemail

  return (
    <Modal
      open={open}
      hasForm
      modalHeading="Create new Person"
      primaryButtonText="Create Person"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={mandatoryCheck}
      onRequestClose={onRequestClose}
      onRequestSubmit={handleSubmit}
    >
      <Form onSubmit={handleSubmit}>
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <TextInput
                labelText="First Name"
                id="firstname"
                name="firstname"
                invalid={hasError('firstname')}
                onChange={handleChange}
                value={form.firstname}
                autoComplete="off"
              />
            </div>
            <div className="bx--col-lg-6">
              <TextInput
                labelText="Last Name"
                id="lastname"
                name="lastname"
                invalid={hasError('lastname')}
                onChange={handleChange}
                value={form.lastname}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <TextInput
                labelText="Address"
                id="addressline1"
                name="addressline1"
                invalid={hasError('addressline1')}
                onChange={handleChange}
                value={form.addressline1}
                autoComplete="off"
              />
            </div>
            <div className="bx--col-lg-6">
              <TextInput
                labelText="City"
                id="city"
                name="city"
                invalid={hasError('city')}
                onChange={handleChange}
                value={form.city}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <TextInput
                labelText="State/Province"
                id="stateprovince"
                name="stateprovince"
                invalid={hasError('stateprovince')}
                onChange={handleChange}
                value={form.stateprovince}
                autoComplete="off"
              />
            </div>
            <div className="bx--col-lg-6">
              <TextInput
                labelText="Postal Code"
                id="postalcode"
                name="postalcode"
                invalid={hasError('postalcode')}
                onChange={handleChange}
                value={form.postalcode}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <TextInput
                labelText="Phone Number"
                id="primaryphone"
                name="primaryphone"
                invalid={mandatoryCheck}
                onChange={handleChange}
                value={num}
                autoComplete="off"
              />
            </div>
            <div className="bx--col-lg-6">
              <TextInput
                labelText="Email"
                id="primaryemail"
                name="primaryemail"
                invalid={mandatoryCheck}
                onChange={handleChange}
                value={form.primaryemail}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

CreatePersonModal.propTypes = {
  open: PropTypes.bool,
  onRequestClose: PropTypes.func.isRequired,
  pluspcustomer: PropTypes.any,
  pelbusunit: PropTypes.string
}
