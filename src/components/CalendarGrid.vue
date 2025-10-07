<template>
  <div class="calendar-grid">
    <div v-for="day in weekDays" :key="day" class="calendar-day calendar-day-header">
      {{ day }}
    </div>

    <div v-for="blank in blanks" :key="'blank-' + blank" class="calendar-day calendar-day-blank"></div>

    <div
      v-for="date in daysInMonth"
      :key="date"
      class="calendar-day calendar-day-large"
      :class="{ today: isToday(date), weekend: isWeekend(date) }"
    >
      <div class="calendar-day-top">
        <span class="day-number">{{ date }}</span>
        <button class="add-reminder-btn" @click="calendarStore.openAddReminder(date)">+</button>
      </div>

      <div class="reminders-list">
        <div
          v-for="reminder in calendarStore
            .getRemindersForDay(date)
            .slice(0, calendarStore.MAX_VISIBLE_REMINDERS)"
          :key="reminder.id"
          class="reminder"
          :style="{ background: reminder.color }"
          @click="calendarStore.openEditReminder(reminder)"
        >
          <div class="reminder-header">
            <span class="reminder-time">{{ reminder.time }}</span>
            <span class="reminder-city">{{ reminder.city }}</span>
            <span v-if="reminder.weather" class="reminder-weather">
              {{ getWeatherEmoji(reminder.weather.weatherCode) }} {{ reminder.weather.temperature }}°C
            </span>
          </div>
          <div class="reminder-text">{{ reminder.text }}</div>
        </div>

        <div
          v-if="calendarStore.getRemindersForDay(date).length > calendarStore.MAX_VISIBLE_REMINDERS"
          class="reminder-overflow"
          @click="calendarStore.openAllReminders(date)"
        >
          +{{ calendarStore.getRemindersForDay(date).length - calendarStore.MAX_VISIBLE_REMINDERS }}
          more
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '../store/CalendarStore'
import { getWeatherEmoji } from '../services/WeatherService'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const today = new Date()

const calendarStore = useCalendarStore()

const firstDayOfMonth = computed(() => {
  return new Date(calendarStore.currentYear, calendarStore.currentMonth, 1)
})

const lastDayOfMonth = computed(() => {
  return new Date(calendarStore.currentYear, calendarStore.currentMonth + 1, 0)
})

const daysInMonth = computed(() => {
  return Array.from({ length: lastDayOfMonth.value.getDate() }, (_, i) => i + 1)
})

const blanks = computed(() => {
  return firstDayOfMonth.value.getDay()
})

function isToday(date: number): boolean {
  return (
    date === today.getDate() &&
    calendarStore.currentMonth === today.getMonth() &&
    calendarStore.currentYear === today.getFullYear()
  )
}

function isWeekend(date: number): boolean {
  const day = new Date(calendarStore.currentYear, calendarStore.currentMonth, date).getDay()
  return day === 0 || day === 6
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.calendar-day {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day-header {
  font-weight: 600;
  color: #64748b;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}

.calendar-day-large {
  min-height: 120px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #f8fafc;
  transition: all 0.2s;
}

.calendar-day-large:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.calendar-day.today {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);
}

.calendar-day.weekend {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}

.calendar-day.today .day-number {
  color: #1e40af;
}

.calendar-day.today .add-reminder-btn {
  background: #3b82f6;
  color: white;
}

.calendar-day.today .add-reminder-btn:hover {
  background: #2563eb;
}

.calendar-day-blank {
  background: transparent;
  border: none;
}

.calendar-day-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-number {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.add-reminder-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #475569;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.calendar-day-large:hover .add-reminder-btn {
  opacity: 1;
}

.add-reminder-btn:hover {
  background: #cbd5e1;
  transform: scale(1.1);
}

.add-reminder-btn:active {
  transform: scale(0.95);
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.reminder {
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reminder:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.reminder-header {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.reminder-time {
  font-weight: 600;
  font-size: 11px;
}

.reminder-city {
  font-size: 11px;
  opacity: 0.9;
}

.reminder-weather {
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
}

.reminder-text {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reminder-overflow {
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  background: #e2e8f0;
  color: #475569;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.reminder-overflow:hover {
  background: #cbd5e1;
  transform: translateY(-1px);
}
</style>