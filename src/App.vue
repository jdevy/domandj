<template>
  <div id="app">

    <!-- Barre d'outils avec les boutons -->
    <v-toolbar density="compact" class="mb-4">
      <v-toolbar-title>Évaluation TP</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn icon="mdi-bug" @click="logStoreState(true)" title="Debug store" />

      <!-- Bouton Administration des classes -->
      <v-tooltip text="Gérer les classes" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-account-group" variant="text" @click="showClasseModal = true" />
        </template>
      </v-tooltip>

      <!-- Bouton Administration des compétences -->
      <v-tooltip text="Gérer les compétences" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-star-circle" variant="text" @click="showCompetenceModal = true" />
        </template>
      </v-tooltip>

      <!-- Bouton Nouvelle session -->
      <v-tooltip text="Nouvelle session" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-plus-circle" variant="text" @click="showNewSessionModal = true"
            :disabled="!hasClasses" />
        </template>
      </v-tooltip>

      <!-- Sélecteur de session (si plusieurs sessions existent) -->
      <v-menu v-if="hasMultipleSessions" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text">
            {{ currentSession?.name || 'Aucune session' }}
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item v-for="session in store.state.sessions" :key="session.id" @click="selectSession(session.id)">
            <v-list-item-title>{{ session.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ session.className }} - {{ session.date }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <div class="version-indicator">v {{ version }}</div>

    <div class="stage-container stage-position" ref="stageContainer">
      <!-- Conteneur pour affichage du titre de la session courante -->
      <div v-if="currentSession" class="session-header">
        <h2 class="session-title">
          {{ currentSession.name }} - ({{ currentSession.className }})
        </h2>
        <v-tooltip text="Réinitialiser la classe" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-refresh" variant="text" color="grey-darken-1" class="reset-button"
              @click="resetClassData" />
          </template>
        </v-tooltip>
      </div>

      <Konvaboard :plots="plots" :students="students" :avatar-image="avatarImage" :stage-size="stageSize"
        @delete-plot="deletePlot" @open-evaluation="openEvaluation" />
      <button class="round-icon-btn plus-btn bottom-left" @click="addPlot">
        <LucidePlus size="24" />
      </button>
      <div class="round-icon-btn trash-zone bottom-right">
        <LucideTrash size="24" />
      </div>
    </div>

    <Evaluation v-if="showEvalModal && currentPlot" v-model:plot-value="currentPlot" :visible="showEvalModal"
      @close="showEvalModal = false" />

    <div v-if="showToast" class="toast-message">
      {{ toastMessage }}
    </div>

    <ClasseManager v-model:visible="showClasseModal" />

    <NewSessionModal v-model:visible="showNewSessionModal" :classes="Object.keys(store.state.classes)"
      :competences="store.state.competences" @create="createNewSession" />

    <CompetenceManager v-model:visible="showCompetenceModal" />


    <!-- <div class="version-indicator">v{{ version }}</div> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, nextTick, computed, watch } from 'vue'
import Konva from 'konva'
import { useEvaluationStore } from './stores/evaluationStore'
import competenceData from './models/competenceData'
import avatarSrc from './assets/duck-icon.svg'
import Konvaboard from './components/Konvaboard.vue'
import Evaluation from './components/Evaluation.vue'
import ClasseManager from './components/ClasseManager.vue'
import NewSessionModal from './components/NewSessionModal.vue'
import CompetenceManager from '@/components/CompetenceManager.vue'
import { logStoreState } from '@/utils/logStore'

import type { Plot, Student } from '@/models'

const version = import.meta.env.PACKAGE_VERSION
const store = useEvaluationStore()

// Données réactives
const stageSize = reactive({ width: window.innerWidth, height: window.innerHeight })
const stageContainer = ref<HTMLElement | null>(null)
const avatarImage = ref<HTMLImageElement | null>(null)
const showEvalModal = ref(false)
const showClasseModal = ref(false)
const showCompetenceModal = ref(false)
const currentPlot = ref<Plot | null>(null)
const showToast = ref(false)
const toastMessage = ref('')
const showNewSessionModal = ref(false)

// Données calculées
const currentSession = computed(() => store.getCurrentSession())
const plots = computed(() => currentSession.value?.plotGroups || [])
const students = computed(() => {
  return currentSession.value
    ? store.state.classes[currentSession.value.className] || []
    : []
})

const filteredCompetences = computed(() => {
  return currentSession.value
    ? competenceData.filter(comp =>
      currentSession.value?.selectedCompetenceIds.includes(comp.id)
    )
    : competenceData
})
const hasMultipleSessions = computed(() => store.state.sessions.length > 1)
const hasClasses = computed(() => Object.keys(store.state.classes).length > 0)



// Méthodes
function createNewSession(sessionData: {
  className: string,
  sessionName: string,
  competenceIds: number[]
}) {
  // Créer la nouvelle session
  const newSession = store.createSession({
    name: sessionData.sessionName,
    className: sessionData.className,
    selectedCompetenceIds: sessionData.competenceIds,
    date: new Date().toISOString().split('T')[0],
  })

  // Positionner les élèves (appel à loadStudents)
  loadStudents()

  // Fermer la modale
  showNewSessionModal.value = false
}


// function selectClass(className: string) {
//   // Trouver ou créer une séance pour cette classe
//   let session = store.state.sessions.find(s => s.className === className)

//   if (!session) {
//     session = store.createSession({
//       name: `Séance pour ${className}`,
//       className: className,
//       selectedCompetenceIds: competenceData.map(c => c.id),
//       date: new Date().toISOString().split('T')[0],
//     })
//   }

//   store.setCurrentSession(session.id)
// }

function addPlot() {
  const session = store.getCurrentSession()
  if (!session) return
  store.addPlot(session.id, {})
}

function selectSession(sessionId: string) {
  store.setCurrentSession(sessionId)
}
function deletePlot(plotId: number) {
  const session = store.getCurrentSession()
  if (!session) return
  store.deletePlot(session.id, plotId)
}

function loadStudents() {
  const session = store.getCurrentSession()
  if (!session) throw new Error("Session introuvable")

  if (session) {
    store.loadStudentsForSession(session.id, stageSize.width, stageSize.height)
  }
}

function openEvaluation(plot: Plot): void {
  showEvalModal.value = false
  const currentStudentIds = students.value
    .filter(s => s.plotId === plot.id)  // Filtrer les élèves dont plotId correspond
    .map(s => s.id)                      // Extraire les IDs

  // // Create an array of Student objects based on the currentStudentIds
  // const currentStudents: Student[] = students.value.filter((s: Student) => currentStudentIds.includes(s.id));

  plot.students = currentStudentIds;

  nextTick(() => {
    currentPlot.value = plot
    showEvalModal.value = true
  })
}


function resetClassData() {
  const session = store.getCurrentSession()
  if (!session) return
  store.pauseAutoSave()
  store.resetSessionPlots(session.id)
  store.resetStudentPositions(session.className)
  store.resumeAutoSave()
}

function triggerToast(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

function resizeStage() {
  if (!stageContainer.value) return
  const rect = stageContainer.value.getBoundingClientRect()
  const padding = 20
  stageSize.width = rect.width
  stageSize.height = window.innerHeight - rect.top - padding
}


onMounted(() => {
  // Charger l'image de l'avatar
  const img = new window.Image()
  img.src = avatarSrc
  img.onload = () => { avatarImage.value = img }

  // Initialiser le store
  if (Object.keys(store.state.classes).length === 0) {
    store.loadInitialData()
  } 

  // Sélectionner la dernière session si elle existe
  if (store.state.sessions.length > 0) {
    const lastSession = store.state.sessions[store.state.sessions.length - 1]
    store.setCurrentSession(lastSession.id)
  } else if (Object.keys(store.state.classes).length > 0) {
    // Créer une session par défaut si aucune n'existe
    const firstClass = Object.keys(store.state.classes)[0]
    store.createSession({
      name: `Séance initiale - ${firstClass}`,
      className: firstClass,
      selectedCompetenceIds: store.state.competences.map(c => c.id)
    })
  }

  // Configurer Konva
  nextTick(() => {
    resizeStage()
    window.addEventListener('resize', resizeStage)
  })
})


onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeStage)
})
</script>

<style scoped>
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  /* margin-bottom: 8px; */
}

.reset-button {
  margin-left: auto;
}
</style>