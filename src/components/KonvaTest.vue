<template>
  <div class="relative w-full h-full">
    <!-- Stage Konva -->
    <v-stage :config="{ width: 300, height: 200 }">
      <v-layer>
        <!-- Bouton : rectangle -->
        <v-rect
          :config="{
            x: 100,
            y: 70,
            width: 100,
            height: 40,
            fill: 'dodgerblue',
            cornerRadius: 8,
            shadowColor: 'black',
            shadowBlur: 4,
            shadowOffset: { x: 2, y: 2 },
            shadowOpacity: 0.3
          }"
          @pointerdown="handleClick"
        />
        <!-- Texte du bouton -->
        <v-text
          :config="{
            x: 115,
            y: 80,
            text: 'Clique-moi',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: 'white'
          }"
          @pointerdown="handleClick"
        />
      </v-layer>
    </v-stage>

    <!-- Popin -->
    <div
      v-if="showPopup"
      class="absolute inset-0 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg p-4 shadow-lg text-center">
        <p class="text-lg font-bold">Hello 👋</p>
        <button
          class="mt-3 px-4 py-2 rounded bg-blue-500 text-white"
          @click="showPopup = false"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showPopup = ref(false)

function handleClick() {
  showPopup.value = true
}
</script>


<style scoped>
/* tu peux ajuster la taille du canvas */
:deep(canvas) {
  touch-action: none; /* important pour Android (empêche le scroll au lieu du clic) */
}
</style>
