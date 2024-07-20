import _ from 'lodash'

export const getAffectedPlaceHolders = form => {
  const { reportedby, reportedbyname, reportedphone, reportedemail } = form

  const affectedFields = _.pick(form, [
    'affectedperson',
    'affectedusername',
    'affectedphone',
    'affectedemail'
  ])

  if (_.some(affectedFields, _.identity)) {
    return {
      affectedperson: '',
      affectedusername: '',
      affectedphone: '',
      affectedemail: ''
    }
  }

  return {
    affectedperson: reportedby,
    affectedusername: reportedbyname,
    affectedphone: reportedphone,
    affectedemail: reportedemail
  }
}
