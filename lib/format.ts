export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function formatIndianCurrency(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatIST(date: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
  } catch (e) {
    return date
  }
}
