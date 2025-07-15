<template>
  <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="emit('close')">✕</button>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* fond sombre */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}
</style>