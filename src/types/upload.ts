// types/upload.ts

export interface DailyActivity {
  labels: string[]
  values: number[]
  allDates: string[]
  startDateObj: Date
  totalDays: number
}

export interface AnalysisStep {
  id: number
  label: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  timeElapsed?: string
}

