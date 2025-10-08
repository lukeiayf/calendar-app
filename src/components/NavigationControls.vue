<template>
  <div class="calendar-header">
    <button 
      @click="calendarStore.prevMonth()" 
      class="nav-btn" 
      aria-label="Previous Month"
    >
      ‹
    </button>
    
    <div class="header-center">
      <h2 class="calendar-title">{{ monthYear }}</h2>
      <MonthYearPicker
        :current-month="calendarStore.currentMonth"
        :current-year="calendarStore.currentYear"
        @update:month-year="handleMonthYearChange"
        @go-to-today="calendarStore.goToToday()"
      />
    </div>
    
    <button 
      @click="calendarStore.nextMonth()" 
      class="nav-btn" 
      aria-label="Next Month"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '../store/CalendarStore'
import MonthYearPicker from './MonthYearPicker.vue'

const calendarStore = useCalendarStore()

const firstDayOfMonth = computed<Date>(
  () => new Date(calendarStore.currentYear, calendarStore.currentMonth, 1)
)

const monthYear = computed<string>(() =>
  firstDayOfMonth.value.toLocaleString('default', { month: 'long', year: 'numeric' })
)

const handleMonthYearChange = (month: number, year: number) => {
  calendarStore.setMonthYear(month, year)
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: center;
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
  font-size: 24px;
  font-weight: 300;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .calendar-header {
    padding: 1.5rem;
  }

  .header-center {
    gap: 8px;
  }

  .calendar-title {
    font-size: 1.25rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
}
</style>