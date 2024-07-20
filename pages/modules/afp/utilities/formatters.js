export const currencyFormatter = ({ value = 0 }) =>
  Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export const lineIdFormatter = ({ value }) => (`${value}`.includes('new_') ? `New` : value)
