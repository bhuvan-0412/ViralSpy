import * as fs from 'fs'

const INPUT_FILE = 'training-data/viralspy-training.jsonl'

const REQUIRED_FIELDS = [
  'hook', 'angles', 'format', 'hashtags',
  'best_post_time', 'estimated_reach', 'script_outline'
]

const VALID_FORMATS = [
  'TALKING_HEAD', 'POV', 'DUET', 
  'TUTORIAL', 'STORYTIME', 'TRANSITION'
]

async function main() {
  console.log('🔍 Validating training data...\n')
  
  const lines = fs.readFileSync(INPUT_FILE, 'utf-8')
    .split('\n').filter(Boolean)
  
  let valid = 0
  let invalid = 0
  const issues: string[] = []

  lines.forEach((line, i) => {
    try {
      const ex = JSON.parse(line)
      const output = ex.output
      
      // Check required fields
      const missing = REQUIRED_FIELDS.filter(
        f => !output[f]
      )
      if (missing.length > 0) {
        issues.push(
          `Line ${i+1}: Missing fields: ${missing.join(', ')}`
        )
        invalid++
        return
      }
      
      // Check hook length (under 10 words)
      const hookWords = output.hook.split(' ').length
      if (hookWords > 10) {
        issues.push(
          `Line ${i+1}: Hook too long (${hookWords} words): "${output.hook}"`
        )
      }
      
      // Check format is valid
      if (!VALID_FORMATS.includes(output.format)) {
        issues.push(
          `Line ${i+1}: Invalid format: ${output.format}`
        )
        invalid++
        return
      }
      
      // Check angles count
      if (!Array.isArray(output.angles) || 
          output.angles.length !== 3) {
        issues.push(
          `Line ${i+1}: Expected 3 angles, got ${output.angles?.length}`
        )
        invalid++
        return
      }
      
      // Check hashtags count
      if (!Array.isArray(output.hashtags) || 
          output.hashtags.length < 3) {
        issues.push(
          `Line ${i+1}: Too few hashtags: ${output.hashtags?.length}`
        )
        invalid++
        return
      }
      
      valid++
    } catch (e) {
      issues.push(`Line ${i+1}: JSON parse error`)
      invalid++
    }
  })
  
  console.log(`✅ Valid examples: ${valid}`)
  console.log(`❌ Invalid examples: ${invalid}`)
  console.log(
    `📊 Quality score: ${
      Math.round((valid/lines.length)*100)
    }%`
  )
  
  if (issues.length > 0) {
    console.log('\n⚠️ Issues found:')
    issues.slice(0, 20).forEach(i => console.log(`  ${i}`))
    if (issues.length > 20) {
      console.log(`  ... and ${issues.length - 20} more`)
    }
  } else {
    console.log('\n🎉 All examples are valid!')
  }
}

main().catch(console.error)
