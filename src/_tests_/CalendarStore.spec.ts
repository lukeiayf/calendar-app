import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as WeatherService from '../services/WeatherService'
import { useCalendarStore } from '../store/CalendarStore'
import type { IReminder } from '../interfaces/IReminder'

vi.mock('../services/WeatherService', () => ({
  getWeather: vi.fn(),
}))

describe('calendarStore', () => {
  let store: ReturnType<typeof useCalendarStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCalendarStore()
    // Reset reminders before each test
    store.reminders.length = 0
  })

  it('initial state is correct', () => {
    expect(store.reminders).toEqual([])
    expect(store.showReminderModal).toBe(false)
    expect(store.editingReminder).toBeNull()
    expect(store.selectedDay).toBeNull()
    expect(store.overflowDay).toBeNull()
    expect(store.isSavingReminder).toBe(false)
  })

  it('openAddReminder sets modal and editingReminder correctly', () => {
    store.openAddReminder(15)
    expect(store.selectedDay).toBe(15)
    expect(store.editingReminder).not.toBeNull()
    expect(store.editingReminder?.date).toContain('-') // date string format
    expect(store.showReminderModal).toBe(true)
    expect(store.overflowDay).toBeNull()
  })

  it('openEditReminder sets modal and editingReminder correctly', () => {
    const reminder = {
      id: 1,
      date: '2025-10-10',
      time: '10:00',
      city: 'City',
      color: '#fff',
      text: 'Test',
      weather: null,
    }
    store.openEditReminder(reminder)
    expect(store.editingReminder).toEqual(reminder)
    expect(store.showReminderModal).toBe(true)
    expect(store.overflowDay).toBeNull()
  })

  it('openAllReminders sets modal and overflowDay correctly', () => {
    store.openAllReminders(20)
    expect(store.overflowDay).toBe(20)
    expect(store.selectedDay).toBe(20)
    expect(store.editingReminder).toBeNull()
    expect(store.showReminderModal).toBe(true)
  })

  it('saveReminder creates a new reminder', async () => {
    const fakeWeather = { temp: 25 }
    ;(WeatherService.getWeather as any).mockResolvedValue(fakeWeather)

    store.openAddReminder(5)
    if (store.editingReminder) {
      store.editingReminder.city = 'TestCity'
      store.editingReminder.time = '12:00'
      store.editingReminder.text = 'New reminder'
    }

    await store.saveReminder()

    expect(store.reminders.length).toBe(1)
    expect(store.reminders?.[0]?.city).toBe('TestCity')
    expect(store.reminders?.[0]?.weather).toEqual(fakeWeather)
    expect(store.showReminderModal).toBe(false)
    expect(store.isSavingReminder).toBe(false)
  })

  it('saveReminder updates an existing reminder', async () => {
    const fakeWeather = { temp: 30 }
    ;(WeatherService.getWeather as any).mockResolvedValue(fakeWeather)

    // Add initial reminder
    store.reminders.push({
      id: 123,
      date: '2025-10-10',
      time: '09:00',
      city: 'OldCity',
      color: '#000',
      text: 'Old reminder',
      weather: null,
    })

    // Edit reminder

    store.openEditReminder(store.reminders[0] as IReminder)
    if (store.editingReminder) {
      store.editingReminder.city = 'UpdatedCity'
      store.editingReminder.time = '10:00'
      store.editingReminder.text = 'Updated reminder'
      store.editingReminder.id = 123
    }

    await store.saveReminder()

    expect(store.reminders.length).toBe(1)
    expect(store.reminders?.[0]?.city).toBe('UpdatedCity')
    expect(store.reminders?.[0]?.weather).toEqual(fakeWeather)
    expect(store.showReminderModal).toBe(false)
    expect(store.isSavingReminder).toBe(false)
  })

  it('deleteReminder removes reminder and closes modal', () => {
    store.reminders.push({
      id: 1,
      date: '2025-10-10',
      time: '10:00',
      city: '',
      color: '',
      text: '',
      weather: null,
    })
    store.showReminderModal = true

    store.deleteReminder(1)

    expect(store.reminders.length).toBe(0)
    expect(store.showReminderModal).toBe(false)
  })

  it('deleteAllRemindersForDay removes all reminders for a day', () => {
    store.reminders.push(
      { id: 1, date: '2025-10-10', time: '10:00', city: '', color: '', text: '', weather: null },
      { id: 2, date: '2025-10-10', time: '11:00', city: '', color: '', text: '', weather: null },
      { id: 3, date: '2025-10-11', time: '09:00', city: '', color: '', text: '', weather: null }
    )

    store.deleteAllRemindersForDay(10)

    expect(store.reminders.length).toBe(1)
    expect(store.reminders?.[0]?.date).toBe('2025-10-11')
  })

  it('closeModal resets modal state', () => {
    store.showReminderModal = true
    store.editingReminder = {
      id: 1,
      date: '',
      time: '',
      city: '',
      color: '',
      text: '',
      weather: null,
    }
    store.selectedDay = 5
    store.overflowDay = 5

    store.closeModal()

    expect(store.showReminderModal).toBe(false)
    expect(store.editingReminder).toBeNull()
    expect(store.selectedDay).toBeNull()
    expect(store.overflowDay).toBeNull()
  })

  it('getRemindersForDay returns sorted reminders for a day', () => {
    const date = store.formatDate(store.currentYear, store.currentMonth, 15)
    store.reminders.push(
      { id: 1, date, time: '12:00', city: '', color: '', text: 'B', weather: null },
      { id: 2, date, time: '09:00', city: '', color: '', text: 'A', weather: null }
    )

    const reminders = store.getRemindersForDay(15)
    expect(reminders.length).toBe(2)
    expect(reminders?.[0]?.time).toBe('09:00')
    expect(reminders?.[1]?.time).toBe('12:00')
  })

  it('prevMonth and nextMonth update currentMonth and currentYear correctly', () => {
    store.currentMonth = 0
    store.currentYear = 2025
    store.prevMonth()
    expect(store.currentMonth).toBe(11)
    expect(store.currentYear).toBe(2024)

    store.nextMonth()
    expect(store.currentMonth).toBe(0)
    expect(store.currentYear).toBe(2025)

    store.currentMonth = 5
    store.currentYear = 2025
    store.prevMonth()
    expect(store.currentMonth).toBe(4)
    expect(store.currentYear).toBe(2025)

    store.nextMonth()
    expect(store.currentMonth).toBe(5)
    expect(store.currentYear).toBe(2025)
  })
})
