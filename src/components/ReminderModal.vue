<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <template v-if="editingReminder">
        <h3>{{ editingReminder.id ? 'Edit Reminder' : 'Add New Reminder' }}</h3>
        <form @submit.prevent="$emit('save')">
          <div class="form-group">
            <label for="reminder-time">
              Time
            </label>
            <input id="reminder-time" type="time" v-model="editingReminder.time" required />
          </div>
          <div class="form-group">
            <label for="reminder-city">
              City
            </label>
            <input
              id="reminder-city"
              type="text"
              v-model="editingReminder.city"
              required
              placeholder="Enter city name"
            />
          </div>
          <div class="form-group">
            <label for="reminder-color">
              Color
            </label>
            <input id="reminder-color" type="color" v-model="editingReminder.color" />
          </div>
          <div class="form-group">
            <label for="reminder-text">
              Description
            </label>
            <input
              id="reminder-text"
              type="text"
              v-model="editingReminder.text"
              required
              maxlength="50"
              placeholder="What's this reminder about?"
            />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">
              {{ editingReminder.id ? 'Update' : 'Save' }}
            </button>
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
            <button
              v-if="editingReminder.id"
              type="button"
              class="btn-danger"
              @click="$emit('delete', editingReminder.id)"
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
            v-for="reminder in allReminders"
            :key="reminder.id"
            class="reminder reminder-modal"
            :style="{ background: reminder.color }"
            @click="$emit('edit-reminder', reminder)"
          >
            <div class="reminder-header">
              <span class="reminder-time">{{ reminder.time }}</span>
              <span class="reminder-city">{{ reminder.city }}</span>
            </div>
            <div class="reminder-text">{{ reminder.text }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('close')">Close</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { IReminder } from '../interfaces/IReminder';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  editingReminder: {
    type: Object as PropType<IReminder>,
    default: null,
  },
  overflowDay: {
    type: Number,
    default: null,
  },
  allReminders: {
    type: Array as PropType<IReminder[]>,
    default: () => [],
  },
})

defineEmits(['close', 'save', 'delete', 'edit-reminder'])
</script>

<style scoped>
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

.reminder-modal {
  margin: 0;
}

@media (max-width: 768px) {
  .modal {
    min-width: 90vw;
    padding: 1.5rem;
  }
}
</style>
