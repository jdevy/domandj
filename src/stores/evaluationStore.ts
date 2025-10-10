// src/stores/evaluationStore.ts
import { reactive, watch, nextTick } from 'vue'
import debounce from 'lodash.debounce'
import type { AppState, Student, Competence, Session, Plot } from '@/models'
import classesData from '@/models/classData'
import competencesData from '@/models/competenceData'

// ==================================================
//  STATE
// ==================================================
let state = reactive<AppState>({
  classes: {},
  competences: [],
  sessions: [],
  currentSessionId: null,
})
let autoSaveEnabled = true // contrôle de l’autosave

// ==================================================
//  INITIALISATION & PERSISTENCE
// ==================================================
function loadInitialData() {
  // Charger les compétences
  state.competences = competencesData
  // Charger les classes
  Object.entries(classesData).forEach(([className, students]) => {
    state.classes[className] = students.map((student: any, index: number) => ({
      ...student,
      id: student.id || Date.now() + index,
      x: 0,
      y: 0,
    }))
  })
}

// ------------------------
// Load / Save
// ------------------------
function loadState() {
  const saved = localStorage.getItem('evaluationAppState')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Solution corrigée: fusion profonde des classes
      if (parsed.classes) {
        Object.entries(parsed.classes).forEach(([className, students]) => {
          if (!state.classes[className]) {
            state.classes[className] = []
          }
          const existingStudents = state.classes[className]
          const existingStudentIds = new Set(existingStudents.map(s => s.id))
          const savedStudents = students as Student[]
          savedStudents.forEach(savedStudent => {
            if (!existingStudentIds.has(savedStudent.id)) {
              state.classes[className].push({
                ...savedStudent
   //             plotId: undefined, // Suppression de plotId
              })
            }
          })
        })
      }
      // Charger les autres données normalement
      state.competences = parsed.competences || state.competences
      state.sessions = parsed.sessions || state.sessions
      state.currentSessionId = parsed.currentSessionId || state.currentSessionId
      // Réconcilier les données
      reconcilePlotsAndStudents()
      reassignStudentPositions()
    } catch (e) {
      console.error("Erreur de chargement de l'état", e)
      loadInitialData()
    }
  } else {
    loadInitialData()
  }
}

// Sauvegarde
function saveState() {
  if (!autoSaveEnabled) return
  localStorage.setItem(
    'evaluationAppState',
    JSON.stringify({
      classes: state.classes,
      competences: state.competences,
      sessions: state.sessions,
      currentSessionId: state.currentSessionId,
    })
  )
}

// Autosave automatique (debounced)
const debouncedSave = debounce(saveState, 1000)
watch(
  state,
  () => {
    if (autoSaveEnabled) debouncedSave()
  },
  { deep: true }
)

// ==================================================
//  AUTOSAVE CONTROL
// ==================================================
function pauseAutoSave() {
  autoSaveEnabled = false
  console.log('⏸️ AutoSave suspendu')
}

function resumeAutoSave() {
  autoSaveEnabled = true
  console.log('▶️ AutoSave repris')
  saveState()
}

// ==================================================
//  RECONCILIATION
// ==================================================
function reconcilePlotsAndStudents() {
  state.sessions.forEach((session) => {
    const classStudents = state.classes[session.className] || []
    // Nettoyer plot.students invalides
    session.plotGroups.forEach((plot) => {
      plot.students = plot.students.filter((studentId) =>
        classStudents.some((s) => s.id === studentId)
      )
    })
  })
}

// Réaffecte les positions X/Y des élèves sur les plots
function reassignStudentPositions() {
  state.sessions.forEach((session) => {
    const classStudents = state.classes[session.className] || []
    session.plotGroups.forEach((plot) => {
      plot.students.forEach((studentId, idx) => {
        const student = classStudents.find((s) => s.id === studentId)
        if (student) {
          student.x = plot.x + 10
          student.y = plot.y + 40 + idx * 40
        }
      })
    })
  })
}

// ==================================================
//  SESSIONS
// ==================================================
function createSession(sessionData: {
  name: string
  className: string
  selectedCompetenceIds: number[]
  date?: string
}) {
  const newSession: Session = {
    id: Date.now().toString(),
    name: sessionData.name,
    className: sessionData.className,
    date: sessionData.date || new Date().toISOString().split('T')[0],
    plotGroups: [],
    selectedCompetenceIds: sessionData.selectedCompetenceIds,
  }
  state.sessions.push(newSession)
  state.currentSessionId = newSession.id
  return newSession
}

function getCurrentSession() {
  return state.sessions.find((s) => s.id === state.currentSessionId)
}

function setCurrentSession(sessionId: string) {
  state.currentSessionId = sessionId
}

function resetSessionPlots(sessionId: string) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')
  session.plotGroups = []
}

// ==================================================
//  PLOTS
// ==================================================
function addPlot(sessionId: string, partialPlot: Partial<Plot>) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')
  const newPlot: Plot = {
    id:
      session.plotGroups.length > 0
        ? Math.max(...session.plotGroups.map((p) => p.id)) + 1
        : 1,
    name: partialPlot.name || `Plot ${session.plotGroups.length + 1}`,
    x: partialPlot.x ?? 100,
    y: partialPlot.y ?? 200,
    students: partialPlot.students || [],
    evaluations: {},
  }
  session.plotGroups.push(newPlot)
  return newPlot
}

function deletePlot(sessionId: string, plotId: number) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')
  session.plotGroups = session.plotGroups.filter((p) => p.id !== plotId)
}

// ==================================================
//  ÉLÈVES
// ==================================================
function resetStudentPositions(className: string) {
  if (!state.classes[className]) return
  state.classes[className] = state.classes[className].map((student, index) => ({
    ...student,
    x: 800,
    y: 50 + index * 40,
  }))
}

function loadStudentsForSession(sessionId: string, stageWidth: number, stageHeight: number) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')
  const className = session.className
  const classStudents = state.classes[className] || []
  const baseX = stageWidth - 130
  const baseY = 50
  state.classes[className] = classStudents.map((student, index) => ({
    ...student,
    x: baseX,
    y: baseY + index * 40,
  }))
}

// ==================================================
// 🔗 COHÉRENCE ÉLÈVE / PLOT
// ==================================================
function assignStudentToPlot(sessionId: string, studentId: number, plotId: number) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')
  const plot = session.plotGroups.find((p) => p.id === plotId)
  if (!plot) return

  // Retirer de tous les plots de la session
  session.plotGroups.forEach(p => {
    p.students = p.students.filter(id => id !== studentId)
  })

  // Ajouter au plot
  if (!plot.students.includes(studentId)) plot.students.push(studentId)
}

function removeStudentFromPlot(sessionId: string, studentId: number, plotId: number) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')
  const plot = session.plotGroups.find(p => p.id === plotId)
  if (plot) {
    plot.students = plot.students.filter(id => id !== studentId)
  }
}

function moveStudentToPlot(sessionId: string, studentId: number, newPlotId: number) {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session introuvable')

  // Retirer de tous les plots de la session
  session.plotGroups.forEach(p => {
    p.students = p.students.filter(id => id !== studentId)
  })

  // Ajouter au nouveau plot
  assignStudentToPlot(sessionId, studentId, newPlotId)
}

// ==================================================
// EXPORT
// ==================================================
loadState()
export function useEvaluationStore() {
  return {
    state,
    // Initialisation
    loadInitialData,
    // Sessions
    getCurrentSession,
    setCurrentSession,
    createSession,
    resetSessionPlots,
    // Plots
    addPlot,
    deletePlot,
    // Élèves
    resetStudentPositions,
    loadStudentsForSession,
    // Cohérence élève/plot
    assignStudentToPlot,
    removeStudentFromPlot,
    moveStudentToPlot,
    // Autosave
    pauseAutoSave,
    resumeAutoSave,
  }
}
