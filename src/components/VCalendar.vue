<template>
  <div class="calendar">
    <NavigationControls />

    <CalendarGrid />

    <ReminderModal
      :show="calendarStore.showReminderModal"
      :editingReminder="calendarStore.editingReminder"
      :overflowDay="calendarStore.overflowDay"
      :allReminders="
        calendarStore.overflowDay
          ? calendarStore.getAllRemindersForDay(calendarStore.overflowDay)
          : []
      "
      :is-loading="calendarStore.isSavingReminder"
      @close="calendarStore.closeModal()"
      @save="calendarStore.saveReminder()"
      @delete="calendarStore.deleteReminder"
      @edit-reminder="calendarStore.openEditReminder"
    />
  </div>
</template>

<script setup lang="ts">
import ReminderModal from './ReminderModal.vue'
import { useCalendarStore } from '../store/CalendarStore'
import NavigationControls from './NavigationControls.vue'
import CalendarGrid from './CalendarGrid.vue'

const calendarStore = useCalendarStore()
</script>

<style scoped>
.calendar {
  max-width: 1400px;
  margin: 2rem auto;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

@media (max-width: 1024px) {
  .calendar {
    max-width: 100%;
    margin: 1rem;
  }
}
</style>
