/**
 * Simple in-memory rate limiter for feedback form.
 * Max 3 submissions per hour per IP.
 */

const submissions = new Map<string, number[]>()
const MAX_SUBMISSIONS = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

function prune(ips: number[]): number[] {
  const now = Date.now()
  return ips.filter((t) => now - t < WINDOW_MS)
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const timestamps = submissions.get(ip) ?? []
  const pruned = prune(timestamps)

  if (pruned.length >= MAX_SUBMISSIONS) {
    const oldest = Math.min(...pruned)
    return {
      allowed: false,
      retryAfter: Math.ceil((oldest + WINDOW_MS - now) / 1000),
    }
  }

  pruned.push(now)
  submissions.set(ip, pruned)
  return { allowed: true }
}
