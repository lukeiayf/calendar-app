<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn" aria-label="Previous Month">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h2 class="calendar-title">{{ monthYear }}</h2>
      <button @click="nextMonth" class="nav-btn" aria-label="Next Month">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
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
        :class="{ today: isToday(date) }"
      >
        <div class="calendar-day-top">
          <span class="day-number">{{ date }}</span>
          <button class="add-reminder-btn" @click="openAddReminder(date)" title="Add reminder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
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
    <div v-if="showReminderModal" class="modal-overlay" @click.self="showReminderModal = false">
      <div class="modal">
        <template v-if="editingReminder">
          <h3>{{ editingReminder.id ? 'Edit Reminder' : 'Add New Reminder' }}</h3>
          <form @submit.prevent="saveReminder">
            <div class="form-group">
              <label for="reminder-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Time
              </label>
              <input id="reminder-time" type="time" v-model="editingReminder.time" required />
            </div>
            <div class="form-group">
              <label for="reminder-city">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                City
              </label>
              <input id="reminder-city" type="text" v-model="editingReminder.city" required placeholder="Enter city name" />
            </div>
            <div class="form-group">
              <label for="reminder-color">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Color
              </label>
              <input id="reminder-color" type="color" v-model="editingReminder.color" />
            </div>
            <div class="form-group">
              <label for="reminder-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Description
              </label>
              <input id="reminder-text" type="text" v-model="editingReminder.text" required maxlength="50" placeholder="What's this reminder about?" />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-primary">
                {{ editingReminder.id ? 'Update' : 'Save' }}
              </button>
              <button type="button" class="btn-secondary" @click="showReminderModal = false">Cancel</button>
              <button
                v-if="editingReminder.id"
                type="button"
                class="btn-danger"
                @click="deleteReminder(editingReminder.id)"
              >
                Delete
              </button>
            </div>
          </form>
        </template>
        <template v-else>
          <h3>All Reminders - Day {{ overflowDay }}</h3>
          <div class="reminders-modal-list">
            <div
              v-for="reminder in allRemindersForDay(overflowDay)"
              :key="reminder.id"
              class="reminder reminder-modal"
              :style="{ background: reminder.color }"
              @click="openEditReminder(reminder)"
            >
              <div class="reminder-header">
                <span class="reminder-time">{{ reminder.time }}</span>
                <span class="reminder-city">{{ reminder.city }}</span>
              </div>
              <div class="reminder-text">{{ reminder.text }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showReminderModal = false">Close</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1))
const lastDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0))

const daysInMonth = computed(() =>
  Array.from({ length: lastDayOfMonth.value.getDate() }, (_, i) => i + 1)
)

const blanks = computed(() => firstDayOfMonth.value.getDay())

const monthYear = computed(() =>
  firstDayOfMonth.value.toLocaleString('default', { month: 'long', year: 'numeric' })
)

function isToday(date) {
  return (
    date === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Reminders state
const reminders = ref([])
// { id, date: 'YYYY-MM-DD', time: 'HH:mm', city, color, text }

const showReminderModal = ref(false)
const editingReminder = ref(null)
const selectedDay = ref(null)
const MAX_VISIBLE_REMINDERS = 2
const overflowDay = ref(null)

function openAddReminder(day) {
  selectedDay.value = day
  editingReminder.value = {
    id: null,
    date: `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    time: '',
    city: '',
    color: '#667eea',
    text: '',
  }
  showReminderModal.value = true
}

function openEditReminder(reminder) {
  editingReminder.value = { ...reminder }
  showReminderModal.value = true
}

function saveReminder() {
  if (editingReminder.value.id) {
    // Edit
    const idx = reminders.value.findIndex(r => r.id === editingReminder.value.id)
    if (idx !== -1) reminders.value[idx] = { ...editingReminder.value }
  } else {
    // Add
    editingReminder.value.id = Date.now()
    reminders.value.push({ ...editingReminder.value })
  }
  showReminderModal.value = false
}

function deleteReminder(id) {
  reminders.value = reminders.value.filter(r => r.id !== id)
  showReminderModal.value = false
}

function remindersForDay(day) {
  const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return reminders.value
    .filter(r => r.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time))
}

function showAllReminders(day) {
  overflowDay.value = day
  selectedDay.value = day
  showReminderModal.value = true
  editingReminder.value = null // Not editing, just viewing all
}

function allRemindersForDay(day) {
  const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 16px;
  min-width: 420px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

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
