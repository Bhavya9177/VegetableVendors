export const formatPrice = (paise) => {
  if (paise == null) return '₹0.00'
  return `₹${(paise / 100).toFixed(2)}`
}
