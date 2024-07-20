export const currencyFormatter = ({ value = 0 }) =>
  Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export const descriptionFormatter = ({ value = '' }) =>
  String(value).substring(0, Math.min(100, String(value).length))

export const numberFormatter = ({ value }) => value && Number(value)

export const numberCurrencyFormatter = ({ value }) =>
  ((Number(value) === 0 && !['', '-0'].includes(value)) || (value && Number(value))) &&
  Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
