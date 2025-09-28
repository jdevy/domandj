<template>
  <div v-if="visible && currentPlot" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="handleClose">✕</button>
      <h2>{{ getStudentNames(currentPlot) }}</h2>

      <!-- Utilisation directe de CompetenceToggle avec le statut actuel -->
      <CompetenceToggle
        v-for="comp in filteredCompetences"
        :key="comp.id"
        :label="comp.libelle_long || 'Compétence inconnue'"
        :value="getCompetenceStatus(comp.id)"
        @update:value="updateCompetence(comp.id, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CompetenceToggle from './CompetenceToggle.vue'
import type { Plot } from '@/models'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { computed } from 'vue'

const props = defineProps<{
  plotValue: Plot | null
  visible: boolean
}>()

const emit = defineEmits(['update:plotValue', 'close'])
const store = useEvaluationStore()

// Récupérer le plot courant depuis le store
const currentPlot = computed(() => {
  if (!props.plotValue) return null
  const session = store.getCurrentSession()
  if (!session) return null
  return session.plotGroups.find(p => p.id === props.plotValue?.id) || null
})

// Récupérer les compétences filtrées pour cette session
const filteredCompetences = computed(() => {
  const session = store.getCurrentSession()
  if (!session) return []

  // On retourne les compétences avec leur statut actuel
  return store.state.competences
    .filter(comp => session.selectedCompetenceIds.includes(comp.id))
    .map(comp => ({
      ...comp,
      statut: currentPlot.value?.evaluations?.[comp.id] ?? null
    }))
})

// Fonction pour trouver un étudiant par son ID
function getStudentById(id: number) {
  const session = store.getCurrentSession()
  if (!session) return null
  const classStudents = store.state.classes[session.className] || []
  return classStudents.find(s => s.id === id)
}

function getStudentNames(plot: Plot) {
  return plot?.students.map(id => {
    const student = getStudentById(id)
    return student ? student.name : 'Inconnu'
  }).join(' / ')
}

// Récupérer le statut d'une compétence
function getCompetenceStatus(competenceId: number): boolean | null {
  return currentPlot.value?.evaluations?.[competenceId] ?? null
}

// Mettre à jour une compétence
function updateCompetence(competenceId: number, statut: boolean | null) {
  if (!currentPlot.value) return
  const session = store.getCurrentSession()
  if (!session) return

  const plotIndex = session.plotGroups.findIndex(p => p.id === currentPlot.value?.id)
  if (plotIndex !== -1) {
    const updatedEvaluations = {
      ...session.plotGroups[plotIndex].evaluations,
      [competenceId]: statut
    }

    session.plotGroups[plotIndex] = {
      ...session.plotGroups[plotIndex],
      evaluations: updatedEvaluations
    }

    emit('update:plotValue', session.plotGroups[plotIndex])
  }
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  /* fond sombre */
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

.competence {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.buttons button {
  margin-left: 8px;
  padding: 4px 10px;
  font-size: 1.1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.buttons button.selected {
  font-weight: bold;
  background-color: #d4f4dd;
  /* ✅ vert clair */
}

.buttons button:nth-child(2).selected {
  background-color: #f9caca;
  /* ❌ rouge clair */
}

.modal-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>