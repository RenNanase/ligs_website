import { prisma } from "@/lib/prisma"

/**
 * Log user activity for audit trail.
 * Call after successful mutations.
 */
export async function logActivity(
  userId: string,
  userName: string,
  activity: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { userId, userName, activity },
    })
  } catch (err) {
    console.error("[activity-log] Failed to log:", err)
  }
}
