import type { DailyActivity } from "@/types/upload"
import type { ParsedMessage } from "@/types/chat"

// ─── Daily Activity (Chart Data & Dates) ──────────────────────────────────────
export function calculateDailyActivity(messages: ParsedMessage[]): DailyActivity {
  const dateCounts: Record<string, number> = {}
  for (const m of messages) {
    const dateStr = m.timestamp.split('T')[0]
    if (dateStr) {
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1
    }
  }

  const sortedDates = Object.keys(dateCounts).sort()
  if (sortedDates.length === 0) {
    return {
      labels: [],
      values: [],
      allDates: [],
      startDateObj: new Date(),
      totalDays: 0,
    }
  }

  const minDateStr = (sortedDates[0] || new Date().toISOString().split('T')[0]) as string
  const maxDateStr = (sortedDates[sortedDates.length - 1] ||
    new Date().toISOString().split('T')[0]) as string

  const startDateObj = new Date(minDateStr)
  const endDateObj = new Date(maxDateStr)

  const labels: string[] = []
  const values: number[] = []
  const allDates: string[] = []

  const tempDate = new Date(startDateObj)
  while (tempDate <= endDateObj) {
    const year = tempDate.getFullYear()
    const month = String(tempDate.getMonth() + 1).padStart(2, '0')
    const day = String(tempDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    allDates.push(dateStr)

    // Label format "04 Jul"
    const labelStr = tempDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    labels.push(labelStr)

    values.push(dateCounts[dateStr] || 0)

    tempDate.setDate(tempDate.getDate() + 1)
  }

  return {
    labels,
    values,
    allDates,
    startDateObj,
    totalDays: allDates.length - 1 || 1,
  }
}
