<template>
  <div class="calendar">
    
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn" aria-label="Previous Month">
        <
      </button>
      <h2 class="calendar-title">{{ monthYear }}</h2>
      <button @click="nextMonth" class="nav-btn" aria-label="Next Month">
        >
      </button>
    </div>

    <div class="calendar-grid">
      <div class="calendar-day calendar-day-header" v-for="day in weekDays" :key="day">
        {{ day }}
      </div>
      <div
        v-for="blank in blanks"
        :key="'blank-' + blank"
        class="calendar-day calendar-day-blank"
      ></div>
      <div
        v-for="date in daysInMonth"
        :key="date"
        class="calendar-day calendar-day-large"
        :class="{ today: isToday(date), weekend: isWeekend(date) }"
      >
        <div class="calendar-day-top">
          <span class="day-number">{{ date }}</span>
          <button class="add-reminder-btn" @click="openAddReminder(date)" title="Add reminder">
            +
          </button>
        </div>
        <div class="reminders-list">
          <div
            v-for="reminder in remindersForDay(date).slice(0, MAX_VISIBLE_REMINDERS)"
            :key="reminder.id"
            class="reminder"
            :style="{ background: reminder.color }"
            @click="openEditReminder(reminder)"
          >
            <div class="reminder-header">
              <span class="reminder-time">{{ reminder.time }}</span>
              <span class="reminder-city">{{ reminder.city }}</span>
            </div>
            <div class="reminder-text">{{ reminder.text }}</div>
          </div>
          <div
            v-if="remindersForDay(date).length > MAX_VISIBLE_REMINDERS"
            class="reminder-overflow"
            @click="showAllReminders(date)"
          >
            +{{ remindersForDay(date).length - MAX_VISIBLE_REMINDERS }} more
          </div>
        </div>
      </div>
    </div>

    <!-- Reminder Modal -->
    <ReminderModal
      :show="showReminderModal"
      :editingReminder="editingReminder"
      :overflowDay="overflowDay"
      :allReminders="overflowDay ? allRemindersForDay(overflowDay) : []"
      @close="showReminderModal = false"
      @save="saveReminder"
      @delete="deleteReminder"
      @edit-reminder="openEditReminder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import ReminderModal from './ReminderModal.vue'
import type { IReminder, IReminderDraft } from '../interfaces/IReminder'

const today = new Date()
const currentMonth = ref<number>(today.getMonth())
const currentYear = ref<number>(today.getFullYear())

const weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const firstDayOfMonth = computed<Date>(() => new Date(currentYear.value, currentMonth.value, 1))
const lastDayOfMonth = computed<Date>(() => new Date(currentYear.value, currentMonth.value + 1, 0))

const daysInMonth = computed<number[]>(() =>
  Array.from({ length: lastDayOfMonth.value.getDate() }, (_, i) => i + 1)
)

const blanks = computed<number>(() => firstDayOfMonth.value.getDay())

const monthYear = computed<string>(() =>
  firstDayOfMonth.value.toLocaleString('default', { month: 'long', year: 'numeric' })
)

const reminders: Ref<IReminder[]> = ref([])

const showReminderModal = ref<boolean>(false)
const editingReminder = ref<IReminderDraft | null>(null)
const selectedDay = ref<number | null>(null)
const overflowDay = ref<number | null>(null)
const MAX_VISIBLE_REMINDERS = 2

const formatDate = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const createIReminderDraft = (day: number): IReminderDraft => ({
  id: null,
  date: formatDate(currentYear.value, currentMonth.value, day),
  time: '',
  city: '',
  color: '#667eea',
  text: '',
})

function isToday(date: number): boolean {
  return (
    date === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}

function isWeekend(date: number): boolean {
  const dayOfWeek = new Date(currentYear.value, currentMonth.value, date).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function prevMonth(): void {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth(): void {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function openAddReminder(day: number): void {
  selectedDay.value = day
  editingReminder.value = createIReminderDraft(day)
  showReminderModal.value = true
}

function openEditReminder(reminder: IReminder): void {
  editingReminder.value = { ...reminder }
  showReminderModal.value = true
}

function saveReminder(): void {
  const draft = editingReminder.value
  if (!draft) {
    return
  }

  const reminderToSave: IReminder = {
    ...draft,
    id: draft.id ?? Date.now(),
  }

  if (draft.id !== null) {
    const idx = reminders.value.findIndex(r => r.id === draft.id)
    if (idx !== -1) {
      reminders.value[idx] = reminderToSave
    }
  } else {
    reminders.value.push(reminderToSave)
  }

  editingReminder.value = null
  showReminderModal.value = false
}

function deleteReminder(id: number): void {
  reminders.value = reminders.value.filter(r => r.id !== id)
  showReminderModal.value = false
}

function remindersForDay(day: number): IReminder[] {
  const dateStr = formatDate(currentYear.value, currentMonth.value, day)
  return reminders.value
    .filter(r => r.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time))
}

function showAllReminders(day: number): void {
  overflowDay.value = day
  selectedDay.value = day
  showReminderModal.value = true
  editingReminder.value = null
}

function allRemindersForDay(day: number): IReminder[] {
  const dateStr = formatDate(currentYear.value, currentMonth.value, day)
  return reminders.value
    .filter(r => r.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time))
}
</script>

<style scoped>
/* Main Calendar Container */
.calendar {
  max-width: 1400px;
  margin: 2rem auto;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.calendar-title {
  font-weight: 600;
  font-size: 1.75rem;
  margin: 0;
  letter-spacing: -0.5px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(0.95);
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 1.5rem;
  gap: 12px;
  background: #f8f9fa;
}

/* Calendar Day Cells */
.calendar-day {
  text-align: center;
  padding: 0.75rem;
  border-radius: 12px;
  min-height: 2.5rem;
  background: #ffffff;
  position: relative;
  transition: all 0.2s ease;
}

.calendar-day-header {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  background: transparent;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: auto;
  padding: 0.5rem;
}

.calendar-day-large {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.calendar-day-large:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.calendar-day.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.calendar-day.weekend {
  background: lightgray;
  color: #ffffff;
  font-weight: 600;
  border-color: lightgray;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}


.calendar-day.today .day-number {
  color: #ffffff;
}

.calendar-day.today .add-reminder-btn {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.calendar-day.today .add-reminder-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.calendar-day-blank {
  background: transparent;
  border: none;
  pointer-events: none;
}

/* Day Top Section */
.calendar-day-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.add-reminder-btn {
  background: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.calendar-day-large:hover .add-reminder-btn {
  opacity: 1;
}

.add-reminder-btn:hover {
  background: #5568d3;
  transform: scale(1.1);
}

.add-reminder-btn:active {
  transform: scale(0.95);
}

/* Reminders List */
.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}

.reminder {
  color: #ffffff;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.813rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reminder:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}

.reminder-time {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.reminder-city {
  font-size: 0.7rem;
  opacity: 0.9;
  font-weight: 500;
}

.reminder-text {
  font-size: 0.813rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reminder-overflow {
  color: #667eea;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.reminder-overflow:hover {
  background: #ddd6fe;
  border-color: #a78bfa;
  transform: translateY(-1px);
}

/* Modal styles moved to ReminderModal.vue */

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-group label svg {
  color: #667eea;
}

.form-group input[type='time'],
.form-group input[type='text'],
.form-group input[type='color'] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-group input[type='time']:focus,
.form-group input[type='text']:focus,
.form-group input[type='color']:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[type='color'] {
  height: 50px;
  cursor: pointer;
}

/* Modal Actions */
.modal-actions {
  margin-top: 2rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.938rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  flex: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.modal-actions button:active {
  transform: translateY(0);
}

/* Reminders Modal List */
.reminders-modal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.reminder-modal {
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .calendar {
    max-width: 100%;
    margin: 1rem;
  }

  .calendar-grid {
    gap: 8px;
    padding: 1rem;
  }

  .calendar-day-large {
    min-height: 120px;
  }
}

@media (max-width: 768px) {
  .calendar-header {
    padding: 1.5rem;
  }

  .calendar-title {
    font-size: 1.25rem;
  }

  .modal {
    min-width: 90vw;
    padding: 1.5rem;
  }

  .calendar-day-large {
    min-height: 100px;
  }

  .day-number {
    font-size: 1rem;
  }

  .add-reminder-btn {
    opacity: 1;
  }
}
</style>
