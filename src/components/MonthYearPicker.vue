<template>
  <div class="month-year-picker">
    <button 
      type="button"
      class="picker-trigger" 
      @click="togglePicker"
      :aria-label="isOpen ? 'Close date picker' : 'Open date picker'"
    >
      📅
    </button>

    <div v-if="isOpen" class="picker-dropdown" @click.stop>
      <div class="picker-header">
        <input
          v-model.number="selectedYear"
          type="number"
          class="year-input"
          :min="1900"
          :max="2100"
          @keydown.enter="applyYear"
          aria-label="Year"
        />
      </div>

      <div class="months-grid">
        <button
          v-for="(month, index) in months"
          :key="index"
          type="button"
          class="month-btn"
          :class="{ 
            active: index === selectedMonth && selectedYear === currentYear,
            today: index === todayMonth && selectedYear === todayYear
          }"
          @click="selectMonth(index)"
        >
          {{ month }}
        </button>
      </div>

      <div class="picker-footer">
        <button 
          type="button"
          class="today-btn" 
          @click="goToToday"
        >
          Today
        </button>
      </div>
    </div>

    <div 
      v-if="isOpen" 
      class="picker-backdrop" 
      @click="closePicker"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  currentMonth: number
  currentYear: number
}>()

const emit = defineEmits<{
  'update:month-year': [month: number, year: number]
  'go-to-today': []
}>()

const isOpen = ref(false)
const selectedMonth = ref(props.currentMonth)
const selectedYear = ref(props.currentYear)

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const today = new Date()
const todayMonth = today.getMonth()
const todayYear = today.getFullYear()

const togglePicker = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    selectedMonth.value = props.currentMonth
    selectedYear.value = props.currentYear
  }
}

const closePicker = () => {
  isOpen.value = false
}

const applyYear = () => {
  // Validate year range
  if (selectedYear.value < 1900) selectedYear.value = 1900
  if (selectedYear.value > 2100) selectedYear.value = 2100
}

const selectMonth = (month: number) => {
  applyYear() // Ensure year is valid before selecting month
  selectedMonth.value = month
  emit('update:month-year', month, selectedYear.value)
  closePicker()
}

const goToToday = () => {
  emit('go-to-today')
  closePicker()
}

// Validate year on input change
watch(selectedYear, (newYear) => {
  if (newYear < 1900) selectedYear.value = 1900
  if (newYear > 2100) selectedYear.value = 2100
})

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    closePicker()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.month-year-picker {
  position: relative;
  display: inline-block;
}

.picker-trigger {
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
  font-size: 20px;
}

.picker-trigger:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.picker-trigger:active {
  transform: scale(0.95);
}

.picker-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 280px;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.picker-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.year-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: #333;
  transition: all 0.2s ease;
}

.year-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.year-input::-webkit-inner-spin-button,
.year-input::-webkit-outer-spin-button {
  opacity: 1;
  height: 30px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.month-btn {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  transition: all 0.2s ease;
}

.month-btn:hover {
  background: #e9ecef;
  color: #333;
  transform: translateY(-1px);
}

.month-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  font-weight: 600;
}

.month-btn.today {
  border-color: #667eea;
  color: #667eea;
  font-weight: 600;
}

.month-btn.active.today {
  border-color: white;
  color: white;
}

.picker-footer {
  padding-top: 12px;
  border-top: 2px solid #f0f0f0;
}

.today-btn {
  width: 100%;
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .picker-dropdown {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>