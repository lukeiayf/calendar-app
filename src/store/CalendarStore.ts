import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import type { IReminder, IReminderDraft } from '../interfaces/IReminder'
import { getWeather } from '../services/WeatherService'

export const useCalendarStore = defineStore('calendarStore', () => {
  // State - Reminders
  const reminders: Ref<IReminder[]> = ref([])

  // State - Modal
  const showReminderModal = ref<boolean>(false)
  const editingReminder = ref<IReminderDraft | null>(null)
  const selectedDay = ref<number | null>(null)
  const overflowDay = ref<number | null>(null)
  const isSavingReminder = ref<boolean>(false)

  // State - Calendar Navigation
  const today = new Date()
  const currentMonth = ref<number>(today.getMonth())
  const currentYear = ref<number>(today.getFullYear())

  // Constants
  const MAX_VISIBLE_REMINDERS = 2

  // Computed - Date Formatting
  const formatDate = (year: number, month: number, day: number): string =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Computed - Get reminders for a specific day
  const getRemindersForDay = computed(() => {
    return (day: number): IReminder[] => {
      const dateStr = formatDate(currentYear.value, currentMonth.value, day)
      return reminders.value
        .filter(r => r.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time))
    }
  })

  // Actions - Reminder Management

  // Create a new reminder draft for a specific day
  const createReminderDraft = (day: number): IReminderDraft => ({
    id: null,
    date: formatDate(currentYear.value, currentMonth.value, day),
    time: '',
    city: '',
    color: '#667eea',
    text: '',
    weather: null,
  })

  //Open modal to add a new reminder
  const openAddReminder = (day: number): void => {
    selectedDay.value = day
    editingReminder.value = createReminderDraft(day)
    overflowDay.value = null
    showReminderModal.value = true
  }

  //Open modal to  an existing reminder
  const openEditReminder = (reminder: IReminder): void => {
    editingReminder.value = { ...reminder }
    overflowDay.value = null
    showReminderModal.value = true
  }

  //Open modal to show all reminders for a specific day
  const openAllReminders = (day: number): void => {
    overflowDay.value = day
    selectedDay.value = day
    editingReminder.value = null
    showReminderModal.value = true
  }

  //Save a reminder (create new or update existing)
  const saveReminder = async (): Promise<void> => {
    const draft = editingReminder.value
    if (!draft) {
      return
    }
    isSavingReminder.value = true

    try {
      const weather = await getWeather(draft.city, draft.date)

      const reminderToSave: IReminder = {
        ...draft,
        id: draft.id ?? Date.now(),
      }

      if (draft.id !== null) {
        // Update existing reminder
        const idx = reminders.value.findIndex(r => r.id === draft.id)
        if (idx !== -1) {
          reminders.value[idx] = { ...reminderToSave, weather }
        }
      } else {
        // Create new reminder
        const newReminder: IReminder = {
          ...reminderToSave,
          id: Date.now(),
          weather,
        } as IReminder
        reminders.value.push(newReminder)
      }

      closeModal()
    } catch (error) {
      console.error('Error saving reminder:', error)
    } finally {
      isSavingReminder.value = false
    }
  }

  //Delete a reminder by ID
  const deleteReminder = (id: number): void => {
    reminders.value = reminders.value.filter(r => r.id !== id)
    closeModal()
  }

  const deleteAllRemindersForDay = (day: number): void => {
    const dateStr = formatDate(currentYear.value, currentMonth.value, day)
    reminders.value = reminders.value.filter(r => r.date !== dateStr)
  }

  //Close the reminder modal and reset state
  const closeModal = (): void => {
    showReminderModal.value = false
    editingReminder.value = null
    selectedDay.value = null
    overflowDay.value = null
  }

  //Get all reminders for a specific day (used in overflow modal)
  const getAllRemindersForDay = (day: number): IReminder[] => {
    const dateStr = formatDate(currentYear.value, currentMonth.value, day)
    return reminders.value
      .filter(r => r.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  // Actions - Navigation

  //Navigate to previous month
  const prevMonth = (): void => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }

  //Navigate to next month
  const nextMonth = (): void => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }

  return {
    // State
    reminders,
    showReminderModal,
    editingReminder,
    selectedDay,
    overflowDay,
    currentMonth,
    currentYear,
    isSavingReminder,

    // Constants
    MAX_VISIBLE_REMINDERS,

    // Computed
    getRemindersForDay,

    // Actions
    openAddReminder,
    openEditReminder,
    openAllReminders,
    saveReminder,
    deleteReminder,
    deleteAllRemindersForDay,
    closeModal,
    getAllRemindersForDay,
    prevMonth,
    nextMonth,
    formatDate,
  }
})
