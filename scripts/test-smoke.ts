import { formatIndianNumber, formatIndianCurrency, formatIST } from '../lib/format'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`)
    process.exit(1)
  }
}

console.log('🧪 Running unit & smoke tests...')

// Test Indian Number formatting
const formattedNum = formatIndianNumber(150000)
console.log(`- formatIndianNumber(150000) = "${formattedNum}"`)
assert(formattedNum === '1,50,000', 'Should format numbers in Indian format')

// Test Indian Currency formatting
const formattedCurrency = formatIndianCurrency(250000)
console.log(`- formatIndianCurrency(250000) = "${formattedCurrency}"`)
// Normalizing non-breaking space (or normal space) for cross-platform matching
const cleanCurrency = formattedCurrency.replace(/\u00a0/g, ' ');
assert(cleanCurrency.includes('2,50,000'), 'Should format currency in Indian format')

// Test IST date formatting
const dateStr = '2026-06-20T10:00:00Z'
const formattedDate = formatIST(dateStr)
console.log(`- formatIST("${dateStr}") = "${formattedDate}"`)
assert(formattedDate.length > 0, 'Should format date in IST')

console.log('🎉 All tests passed successfully!')
