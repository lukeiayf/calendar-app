export interface IReminder {
  id: number
  date: string
  time: string
  city: string
  color: string
  text: string
}

export type IReminderDraft = Omit<IReminder, 'id'> & { id: number | null }
