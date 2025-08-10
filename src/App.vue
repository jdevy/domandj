<template>
  <div id="app">
    <h1>Evaluation TP</h1>

    <div class="class-selector" style="display: flex; align-items: center; gap: 10px;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap; flex-grow: 1;">
        <span
          v-for="(students, className) in classes"
          :key="className"
          :class="['class-chip', { active: selectedClass === className }]"
          @click="selectClass(className)"
        >
          {{ className }}
        </span>
      </div>

      <!-- Bouton réinitialiser -->
      <button @click="resetClassData" title="Réinitialiser la classe" class="icon-btn">
        <LucideRefreshCw size="24" />
      </button>
    </div>

    <div class="main-content">
      <div class="stage-container stage-position" ref="stageContainer">
        <Konvaboard
          :plots="plots"
          :students="students"
          :avatar-image="avatarImage"
          :stage-size="stageSize"
          @update:plots="plots = $event"
          @update:students="students = reorderStudents($event)"
          @delete-plot="deletePlot"
          @open-evaluation="openEvaluation"
        />

        <button class="round-icon-btn plus-btn bottom-left" @click="addPlot">
          <LucidePlus size="24" />
        </button>

        <div class="round-icon-btn trash-zone bottom-right">
          <LucideTrash size="24" />
        </div>
      </div>
    </div>

    <Evaluation
      v-if="showEvalModal && currentPlot"
      v-model="currentPlot"
      :competenceList="competences"
      :visible="showEvalModal"
      @close="showEvalModal = false"
    />

    <div v-if="showToast" class="toast-message">
      Classe réinitialisée
    </div>

    <div class="version-indicator">v{{ version }}</div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, nextTick, computed, watch } from 'vue'
import Konva from 'konva'
import debounce from 'lodash.debounce'
import classData from './models/classData'
import competenceData from './models/competenceData'
import avatarSrc from './assets/duck-icon.svg'
import Konvaboard from './components/Konvaboard.vue'
import Evaluation from './components/Evaluation.vue'
import type { Plot, Student, EvaluationSnapshot } from '@/models'
import { loadEvaluationSnapshotFromLocalStorage, saveEvaluationToLocalStorage } from '@/services/evaluationStorage'

const version = import.meta.env.PACKAGE_VERSION
// Données réactives
const stageSize = reactive<{ width: number; height: number }>({
  width: window.innerWidth,
  height: window.innerHeight
})

const classes = classData
const competences = competenceData
const stageContainer = ref<HTMLElement | null>(null)
const avatarImage = ref<HTMLImageElement | null>(null)
const showEvalModal = ref(false)
const currentPlot = ref<Plot | null>(null)
const allPlots = reactive<Record<string, Plot[]>>({})
const plotCounters = reactive<Record<string, number>>({})

const plots = computed<Plot[]>({
  get: () => allPlots[selectedClass.value] || [],
  set: val => {
    allPlots[selectedClass.value] = val
  }
})

const nextPlotId = ref(3)
const selectedClass = ref('')
const currentIndex = ref(1)
const currentKey = computed(() => `evaluation-${selectedClass.value}-${currentIndex.value}`)
const currentSnapshot = ref<EvaluationSnapshot | null>(null)
const students = ref<Student[]>([])
const showToast = ref(false)

// Méthodes
function reorderStudents(updatedList: Student[]): Student[] {
  const free = updatedList.filter(s => !s.plotId);
  const assigned = updatedList.filter(s => s.plotId);
  return [...free, ...assigned];
}

function saveSnapshot() {
  const snapshot: EvaluationSnapshot = {
    classeId: selectedClass.value,
    classeName: selectedClass.value,
    students: students.value,
    competences,
    plots: plots.value
  }
  saveEvaluationToLocalStorage(currentKey.value, snapshot)
  console.log('💾 Auto-sauvegarde pour', currentKey.value)
}

// Watch sur plots (position + contenu)
watch(
  () => plots.value,
  debounce(saveSnapshot, 500),
  { deep: true }
)

// Watch sur affectation des élèves aux plots
watch(
  () => students.value.map(s => s.plotId),
  debounce(saveSnapshot, 500),
  { deep: true }
)

watch(currentPlot, (newVal) => {
  if (!newVal) return
  plots.value = plots.value.map(p =>
    p.id === newVal.id ? newVal : p
  )
}, { deep: true })

function selectClass(className: string) {
  selectedClass.value = className

  // Initialise le compteur de plot si pas encore fait
  if (!plotCounters[className]) {
    plotCounters[className] = 1
  }

  // Initialise les plots si pas encore fait
  if (!allPlots[className]) {
    allPlots[className] = []
  }

  // Réinitialise les étudiants saveFormToLocalStorageet le formulaire
  students.value = []
  currentPlot.value = null
  showEvalModal.value = false

  // Attendre que le DOM soit mis à jour avant de nettoyer
  nextTick(() => {
    currentPlot.value = null
  })

  // Chargement snapshot ici
  const snapshot = loadEvaluationSnapshotFromLocalStorage(currentKey.value)
  if (snapshot) {
    currentSnapshot.value = snapshot
    students.value = snapshot.students
    plots.value = snapshot.plots
  } else {
    loadStudents()
  }
}

function addPlot(): void {
  const className = selectedClass.value
  if (!plotCounters[className]) {
    plotCounters[className] = 1
  }

  const id = plotCounters[className]
  const name = `Plot ${String.fromCharCode(64 + id)}`
  const newPlot: Plot = {
    id,
    name,
    x: 100 + id * 20,
    y: 200 + id * 20,
    students: [],
    competences: competences.map(c => ({
      ...c,
      statut: null
    }))
  }

  plots.value = [...plots.value, newPlot]
  plotCounters[className]++
}

function deletePlot(plotId: number): void {
  plots.value = plots.value.filter(p => p.id !== plotId)
}

function loadStudents() {
  if (!avatarImage.value) {
    setTimeout(() => loadStudents(), 100)
    return
  }

  const baseX = stageSize.width - 130
  const baseY = 50

  students.value = classes[selectedClass.value].map((student, index) => ({
    ...student,
    x: baseX,
    y: baseY + index * 40,
    plotId: null
  }))
}

function resizeStage() {
  if (!stageContainer.value) return

  const rect = stageContainer.value.getBoundingClientRect()
  const padding = 20

  stageSize.width = rect.width
  stageSize.height = window.innerHeight - rect.top - padding
}

function openEvaluation(plot: Plot): void {
  showEvalModal.value = false

  // Associe les étudiants assignés à ce plot
  const assignedStudents = students.value.filter(s => s.plotId === plot.id)
  plot.students = assignedStudents

  nextTick(() => {
    currentPlot.value = plot
    showEvalModal.value = true
  })
}

function resetClassData() {
  if (!selectedClass.value) {
    alert('Aucune classe sélectionnée.')
    return
  }

  // Confirme la suppression
  if (!confirm(`Voulez-vous vraiment réinitialiser les données pour la classe "${selectedClass.value}" ?`)) {
    return
  }

  // Supprime la clé dans localStorage
  localStorage.removeItem(currentKey.value)

  // Reset des données locales dans l’app
  plots.value = []
  currentPlot.value = null
  showEvalModal.value = false

  // Réinitialise le compteur de plots
  plotCounters[selectedClass.value] = 1

  // Remet à jour la liste des étudiants avec leur position initiale
  if (!avatarImage.value) {
    setTimeout(resetClassData, 100) // attend que avatarImage soit chargé
    return
  }

  const baseX = stageSize.width - 130
  const baseY = 50

  students.value = classes[selectedClass.value].map((student, index) => ({
    ...student,
    x: baseX,
    y: baseY + index * 40,
    plotId: null
  }))

  console.log(`Données de la classe ${selectedClass.value} réinitialisées.`)
  triggerToast()
}

function triggerToast(message = 'Classe réinitialisée') {
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000) // Affiché 2 secondes
}

// Cycle de vie
onMounted(() => {
  const img = new window.Image()
  img.src = avatarSrc
  img.onload = () => {
    avatarImage.value = img
  }

  // Supprimer la latence tactile
  const stage = Konva.stages?.[0];
  if (stage) {
    stage.setAttr('dragDistance', 0);
  }

  nextTick(() => {
    resizeStage()
    window.addEventListener('resize', resizeStage)
  })

  // Déclenche le chargement de la première classe automatiquement
  const defaultClass = Object.keys(classes)[0]
  if (defaultClass) {
    selectClass(defaultClass)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeStage)
})
</script>
