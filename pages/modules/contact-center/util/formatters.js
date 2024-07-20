const formatTelephoneNo = value => value.match(/^\+|\d*/g).join('')

export { formatTelephoneNo }
