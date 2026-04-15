/**
 * Counts the total number of A-type grades (A, A+, A-) from a keputusan peperiksaan string.
 *
 * Handles formats like:
 *   "8A 2B"         → 8
 *   "5A+ 3A 2B"     → 8
 *   "BM:A+, BI:A"   → 2
 *   "A A+ A- B C"   → 3
 */
export function countAGrades(keputusan: string): number {
  const text = keputusan.toUpperCase().trim()
  if (!text) return 0

  let total = 0
  const tokens = text.split(/[\s,;/|]+/)

  for (const token of tokens) {
    const numbered = token.match(/(\d+)\s*A[+\-]?$/)
    if (numbered) {
      total += parseInt(numbered[1], 10)
      continue
    }

    if (/^A[+\-]?$/.test(token)) {
      total += 1
      continue
    }

    // "Subject:A+", "BM:A" format
    if (token.includes(":") && /:\s*A[+\-]?$/.test(token)) {
      total += 1
    }
  }

  return total
}
