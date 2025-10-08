<template>
  <div class="calendar-grid">
    <div v-for="day in weekDays" :key="day" class="calendar-day calendar-day-header">
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
        <div class="reminder-buttons">
          <button v-if="calendarStore.getRemindersForDay(date).length > 0" 
            class="add-reminder-btn" @click="calendarStore.deleteAllRemindersForDay(date)"
            title="Delete all reminders for this day">🗑️</button>
          <button class="add-reminder-btn" @click="calendarStore.openAddReminder(date)">+</button>
        </div>
      </div>

      <div class="reminders-list">
        <div
          v-for="reminder in calendarStore
            .getRemindersForDay(date)
            .slice(0, calendarStore.MAX_VISIBLE_REMINDERS)"
          :key="reminder.id"
          class="reminder"
          :style="{ borderLeftColor: reminder.color }"
          @click="calendarStore.openEditReminder(reminder)"
        >
          <div class="reminder-header">
            <span class="reminder-time">{{ reminder.time }}</span>
            <span class="reminder-city">{{ reminder.city }}</span>
            <span v-if="reminder.weather" class="reminder-weather">
              {{ getWeatherEmoji(reminder.weather.weatherCode) }}
              {{ reminder.weather.temperature }}°C
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
import { computed } from 'vue';
import { useCalendarStore } from '../store/CalendarStore';
import { getWeatherEmoji } from '../services/WeatherService';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const today = new Date();

const calendarStore = useCalendarStore();

const firstDayOfMonth = computed(() => {
  return new Date(calendarStore.currentYear, calendarStore.currentMonth, 1);
});

const lastDayOfMonth = computed(() => {
  return new Date(calendarStore.currentYear, calendarStore.currentMonth + 1, 0);
});

const daysInMonth = computed(() => {
  return Array.from({ length: lastDayOfMonth.value.getDate() }, (_, i) => i + 1);
});

const blanks = computed(() => {
  return firstDayOfMonth.value.getDay();
});

function isToday(date: number): boolean {
  return (
    date === today.getDate() &&
    calendarStore.currentMonth === today.getMonth() &&
    calendarStore.currentYear === today.getFullYear()
  );
}

function isWeekend(date: number): boolean {
  const day = new Date(calendarStore.currentYear, calendarStore.currentMonth, date).getDay();
  return day === 0 || day === 6;
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  background-color: white;
  min-height: 100px;
  padding: 8px;
}

.calendar-day-header {
  font-weight: 600;
  text-align: center;
  min-height: auto;
  padding: 12px 8px;
  background-color: #f5f5f5;
}

.calendar-day-large {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 120px;
  position: relative;
  transition: background-color 0.2s;
}

.calendar-day-large:hover {
  background-color: #fafafa;
}

.calendar-day-large:hover .add-reminder-btn {
  opacity: 1;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.calendar-day.today:hover {
  background-color: #bbdefb;
}

.calendar-day.weekend {
  background-color: #fafafa;
}

.calendar-day.today .day-number {
  color: #1976d2;
}

.calendar-day.today .add-reminder-btn {
  color: #1976d2;
}

.calendar-day.today .add-reminder-btn:hover {
  background-color: #1976d2;
  color: white;
}

.calendar-day-blank {
  background-color: #f9f9f9;
  pointer-events: none;
}

.calendar-day-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.day-number {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.add-reminder-btn {
  background: none;
  border: 1px solid #ddd;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  color: #666;
}

.calendar-day-large:hover .add-reminder-btn {
  opacity: 1;
}

.add-reminder-btn:hover {
  background-color: #f0f0f0;
  border-color: #999;
  transform: scale(1.1);
}

.add-reminder-btn:active {
  transform: scale(0.95);
}

.reminder-buttons {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.reminder {
  padding: 6px 8px;
  padding-left: 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
  border-left: 4px solid #ccc;
}

.reminder:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  background-color: #f0f1f3;
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
  color: #333;
}

.reminder-city {
  font-size: 11px;
  opacity: 1;
  color: #555;
}

.reminder-weather {
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
  color: #555;
}

.reminder-text {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #444;
}

.reminder-overflow {
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  text-align: center;
  background-color: #f0f0f0;
  color: #666;
  font-weight: 500;
  transition: all 0.2s;
}

.reminder-overflow:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}
</style>