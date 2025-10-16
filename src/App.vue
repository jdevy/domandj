<template>
  <div id="app">
    <!-- Barre d'outils avec les boutons -->
    <v-toolbar density="compact" class="mb-4">
      <v-toolbar-title>Évaluation TP</v-toolbar-title>
      <v-spacer></v-spacer>
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
        <v-menu location="bottom-end">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon variant="text" color="grey-darken-1" class="reset-button">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="showSessionEditModal = true">
              <v-list-item-title>
                <v-icon>mdi-pencil</v-icon>
                <span style="color: gray;">&nbsp;&nbsp;(Modifier la session)</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="showReportModal = true">
              <v-list-item-title>
                <v-icon color="green">mdi-table</v-icon>
                <span>&nbsp;&nbsp;Voir le rapport</span>
              </v-list-item-title>
            </v-list-item>
            <v-divider class="my-1"></v-divider>
            <v-list-item @click="logStoreState(true)">
              <v-list-item-title>
                <v-icon color="blue-grey-darken-2">mdi-bug</v-icon>
                <span>&nbsp;&nbsp;Logs techniques</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="showLogsModal = true">
              <v-icon color="blue-grey-darken-2">mdi-file-code</v-icon>
              <span>&nbsp;&nbsp;Logs store</span>
            </v-list-item>
            <v-divider class="my-1"></v-divider>
            <v-list-item @click="resetClassData">
              <v-list-item-title>
                <v-icon color="red">mdi-refresh</v-icon>
                <span>&nbsp;&nbsp;Réinitialiser la session</span>
              </v-list-item-title>
            </v-list-item>
            <v-divider class="my-1"></v-divider>
            <v-list-item @click="deleteCurrentSession">
              <v-list-item-title>
                <v-icon color="red">mdi-delete</v-icon>
                <span>&nbsp;&nbsp;Supprimer la session</span>
              </v-list-item-title>
            </v-list-item>
            <v-divider class="my-1"></v-divider>
            <v-divider class="my-1"></v-divider>
            <v-list-item @click="resetAllData">
              <v-icon color="error">mdi-alert</v-icon>
              <span>&nbsp;&nbsp;Réinitialiser l'application</span>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <Konvaboard :stage-size="stageSize" :avatar-image="avatarImage" @delete-plot="deletePlot"
        @open-evaluation="openEvaluation" />
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
    <EvaluationReport v-model="showReportModal" />
    <NewSessionModal v-model:visible="showNewSessionModal" :classes="Object.keys(store.state.classes)"
      :competences="store.state.competences" @create="createNewSession" />
    <CompetenceManager v-model:visible="showCompetenceModal" />
    <v-dialog v-model="showLogsModal" max-width="800px">
      <v-card>
        <v-card-title class="text-h6">
          État complet du store
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showLogsModal = false" />
        </v-card-title>
        <v-card-actions class="justify-space-between">
          <v-btn text color="primary" @click="copyStoreToClipboard">Copier</v-btn>
          <v-btn text color="primary" @click="showLogsModal = false">Fermer</v-btn>
        </v-card-actions>
        <v-card-text>
          <pre class="store-json">
        {{ formattedStoreState }}
      </pre>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text color="primary" @click="showLogsModal = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import EvaluationReport from '@/components/EvaluationReport.vue'
import { logStoreState } from '@/utils/logStore'
import type { Plot, Student } from '@/models'

const version = import.meta.env.PACKAGE_VERSION
const store = useEvaluationStore()
const showSessionEditModal = ref(false)

// Données réactives
const stageSize = reactive({ width: window.innerWidth, height: window.innerHeight })
const stageContainer = ref<HTMLElement | null>(null)
const avatarImage = ref<HTMLImageElement | null>(null)
const showEvalModal = ref(false)
const showClasseModal = ref(false)
const showCompetenceModal = ref(false)
const currentPlot = ref<Plot | null>(null)
const showToast = ref(false)
const showReportModal = ref(false)
const toastMessage = ref('')
const showNewSessionModal = ref(false)
const showLogsModal = ref(false)

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
    ? store.state.competences.filter(comp =>
      currentSession.value?.selectedCompetenceIds.includes(comp.id)
    )
    : store.state.competences
})
const hasMultipleSessions = computed(() => store.state.sessions.length > 1)
const hasClasses = computed(() => Object.keys(store.state.classes).length > 0)
const formattedStoreState = computed(() => {
  try {
    return JSON.stringify(store.state, null, 2)
  } catch (e) {
    return "Erreur lors de la sérialisation du store"
  }
})

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
  // Positionner les élèves
  loadStudents()
  // Fermer la modale
  showNewSessionModal.value = false
}

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
  store.loadStudentsForSession(session.id, stageSize.width, stageSize.height)
}

function openEvaluation(plot: Plot): void {
  showEvalModal.value = false
  nextTick(() => {
    currentPlot.value = plot
    showEvalModal.value = true
  })
}

function resetClassData() {
  const session = store.getCurrentSession()
  if (!session) return
  if (!confirm(`Êtes-vous sûr de vouloir réinitialiser la classe "${session.className}" ?`)) return
  store.pauseAutoSave()
  store.resetSessionPlots(session.id)
  store.resetStudentPositions(session.className)
  store.resumeAutoSave()
}

function deleteCurrentSession() {
  const session = store.getCurrentSession()
  if (!session) return
  if (!confirm(`Voulez-vous vraiment supprimer la session "${session.name}" ?`)) return

  // Supprimer la session du store
  store.state.sessions = store.state.sessions.filter(s => s.id !== session.id)

  // Si c’était la session courante, réinitialiser currentSessionId
  if (store.state.currentSessionId === session.id) {
    store.state.currentSessionId = store.state.sessions[0]?.id || null
  }
}

function resetAllData() {
  if (!confirm("⚠️ Cette action va supprimer TOUTES les données : classes, sessions et compétences. Continuer ?")) return
  store.state.classes = {}
  store.state.competences = []
  store.state.sessions = []
  store.state.currentSessionId = null

  // Si tu veux vider aussi le localStorage persistant
  localStorage.clear()

  alert("Toutes les données ont été supprimées.")
  location.reload()
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

  // Charger les données initiales UNIQUEMENT si rien n'est sauvegardé
  if (!localStorage.getItem('evaluationAppState')) {
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
      name: `Séance initiale`,
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

function copyStoreToClipboard() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(formattedStoreState.value)
      .then(() => console.log('Store copié dans le presse-papier'))
      .catch(err => console.error('Erreur lors de la copie :', err))
  } else {
    console.warn('Clipboard API non disponible')
  }
}
</script>

<style scoped>
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.reset-button {
  margin-left: auto;
}

.store-json {
  max-height: 70vh;
  overflow-y: auto;
  background: #1e1e1e;
  color: #c6e2ff;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.2;
  white-space: pre-wrap;
}
</style>
