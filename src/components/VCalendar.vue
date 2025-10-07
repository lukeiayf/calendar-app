<template>
  <div class="calendar">
    
    <div class="calendar-header">
      <button @click="calendarStore.prevMonth()" class="nav-btn" aria-label="Previous Month">
        <
      </button>
      <h2 class="calendar-title">{{ monthYear }}</h2>
      <button @click="calendarStore.nextMonth()" class="nav-btn" aria-label="Next Month">
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
          <button class="add-reminder-btn" @click="calendarStore.openAddReminder(date)" title="Add reminder">
            +
          </button>
        </div>
        <div class="reminders-list">
          <div
            v-for="reminder in calendarStore.getRemindersForDay(date).slice(0, calendarStore.MAX_VISIBLE_REMINDERS)"
            :key="reminder.id"
            class="reminder"
            :style="{ background: reminder.color }"
            @click="calendarStore.openEditReminder(reminder)"
          >
            <div class="reminder-header">
              <span class="reminder-time">{{ reminder.time }}</span>
              <span class="reminder-city">{{ reminder.city }}</span>
            </div>
            <div class="reminder-text">{{ reminder.text }}</div>
          </div>
          <div
            v-if="calendarStore.getRemindersForDay(date).length > calendarStore.MAX_VISIBLE_REMINDERS"
            class="reminder-overflow"
            @click="calendarStore.openAllReminders(date)"
          >
            +{{ calendarStore.getRemindersForDay(date).length - calendarStore.MAX_VISIBLE_REMINDERS }} more
          </div>
        </div>
      </div>
    </div>

    <!-- Reminder Modal -->
    <ReminderModal
      :show="calendarStore.showReminderModal"
      :editingReminder="calendarStore.editingReminder"
      :overflowDay="calendarStore.overflowDay"
      :allReminders="calendarStore.overflowDay ? calendarStore.getAllRemindersForDay(calendarStore.overflowDay) : []"
      @close="calendarStore.closeModal()"
      @save="calendarStore.saveReminder()"
      @delete="calendarStore.deleteReminder"
      @edit-reminder="calendarStore.openEditReminder"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ReminderModal from './ReminderModal.vue'
import { useCalendarStore } from '../store/CalendarStore'

// Initialize store
const calendarStore = useCalendarStore()

// Constants
const weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const today = new Date()

// Computed properties for calendar display
const firstDayOfMonth = computed<Date>(() => 
  new Date(calendarStore.currentYear, calendarStore.currentMonth, 1)
)

const lastDayOfMonth = computed<Date>(() => 
  new Date(calendarStore.currentYear, calendarStore.currentMonth + 1, 0)
)

const daysInMonth = computed<number[]>(() =>
  Array.from({ length: lastDayOfMonth.value.getDate() }, (_, i) => i + 1)
)

const blanks = computed<number>(() => firstDayOfMonth.value.getDay())

const monthYear = computed<string>(() =>
  firstDayOfMonth.value.toLocaleString('default', { month: 'long', year: 'numeric' })
)

// Helper functions
function isToday(date: number): boolean {
  return (
    date === today.getDate() &&
    calendarStore.currentMonth === today.getMonth() &&
    calendarStore.currentYear === today.getFullYear()
  )
}

function isWeekend(date: number): boolean {
  const dayOfWeek = new Date(calendarStore.currentYear, calendarStore.currentMonth, date).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
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