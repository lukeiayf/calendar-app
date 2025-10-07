import type { IWeatherData } from "./IWeatherData"

export interface IReminder {
  id: number
  date: string
  time: string
  city: string
  color: string
  text: string
  weather?: IWeatherData | null

}

export type IReminderDraft = Omit<IReminder, 'id'> & { id: number | null }
