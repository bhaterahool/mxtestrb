export const floatNumberWithComma = (x) => {
    return x.toLocaleString('en', {minimumFractionDigits: 2})
}