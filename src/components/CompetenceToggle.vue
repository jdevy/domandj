<template>
  <div class="competence-toggle">
    <span class="competence-label">
      {{ label }}
    </span>
    <div class="toggle-buttons">
      <button
        :class="['icon-btn', { selected: value === true }]"
        @click="$emit('update:value', true)"
      >
        <Check class="icon" />
      </button>
      <button
        :class="['icon-btn', { selected: value === false }]"
        @click="$emit('update:value', false)"
      >
        <X class="icon" />
      </button>
      <button
        :class="['icon-btn', { selected: value === null }]"
        @click="$emit('update:value', null)"
      >
        <Circle class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, X, Circle } from 'lucide-vue-next'

defineProps<{
  value: boolean | null
  label: string
}>()

defineEmits(['update:value'])
</script>

<style scoped>
.competence-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.competence-label {
  flex: 1;
  font-size: 1rem;
  margin-right: 1rem;
}

.toggle-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-btn.selected {
  background-color: #e0e0e0;
}
</style>