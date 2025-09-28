<template>
  <div class="stage-wrapper konva-container">
    <v-stage :config="stageSize">
      <v-layer>
        <!-- Plots -->
        <v-group v-for="plot in currentSession?.plotGroups" :key="plot.id"
          :config="{
            x: plot.x,
            y: plot.y,
            draggable: true,
            dragBoundFunc: limitPlotToBounds
          }"
          @dragmove="updatePlotPosition(plot, $event)"
          @dragend="updatePlotPosition(plot, $event)">

          <!-- Affichage du plot -->
          <v-rect :config="getPlotRectStyle(plot, highlightedPlotId === plot.id, plotBeingDeletedId === plot.id)" />

          <!-- Nom du plot -->
          <v-text :config="{ text: plot.name, ...getPlotTextStyle(plot) }" />

          <!-- Indicateur visuel des évaluations -->
          <!-- <v-group v-if="Object.keys(plot.evaluations || {}).length > 0">
            <v-rect :config="getEvaluationIndicatorConfig(plot)" />
          </v-group> -->

          <!-- Bouton Évaluation -->
          <template v-if="hasStudents(plot)">
            <v-group :config="{ ...defaultGroupPosition(110, 100), listening: true }"
              @pointerdown="handleEvaluationClick(plot, $event)">
              <v-rect :config="{ x: 0, y: 0, width: 50, height: 50, fill: 'transparent' }" />
              <v-rect :config="evaluationButtonRect" />
              <v-text :config="evaluationButtonText" />
            </v-group>
          </template>
        </v-group>

        <!-- Élèves -->
        <v-group v-for="(student, index) in currentStudents" :key="student.id"
          :config="{
            ...getStudentPosition(student, index),
            draggable: true,
            dragBoundFunc: limitStudentToBounds
          }"
          @dragmove="highlightPlotUnder(student, $event)"
          @dragend="updateStudentPosition(student, $event)">

          <v-image v-if="avatarImage" :config="getStudentAvatarStyle(avatarImage)" />

          <!-- Étiquette prénom -->
          <v-group>
            <v-rect :config="getStudentLabelRectStyle()" />
            <v-text :config="getStudentLabelTextStyle(student.name)" />
          </v-group>
        </v-group>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { hasStudents } from '@/services/plotService'
import type { Plot, Student, DragKonvaEvent, Position } from '@/models'
import {
  evaluationButtonRect, evaluationButtonText, defaultGroupPosition,
  getPlotRectStyle, getPlotTextStyle, getStudentAvatarStyle,
  getStudentLabelRectStyle, getStudentLabelTextStyle
} from '@/styles/konvaStyles'
import { useEvaluationStore } from '@/stores/evaluationStore'

// Props
const props = defineProps({
  stageSize: { type: Object, required: true },
  avatarImage: { type: Object as () => HTMLImageElement | null, required: false }
})

// Événements
const emit = defineEmits([
  'delete-plot',
  'open-evaluation'
])

// État local
const highlightedPlotId = ref<number | null>(null)
const plotBeingDeletedId = ref<number | null>(null)
const store = useEvaluationStore()

// Données calculées
const currentSession = computed(() => store.getCurrentSession())
const currentStudents = computed(() => {
  if (!currentSession.value) return []
  return store.state.classes[currentSession.value.className] || []
})

// Méthodes
function handleEvaluationClick(plot: Plot, evt: any) {
  evt.cancelBubble = true
  emit('open-evaluation', { ...plot }) // Créer une copie pour éviter les références
}

function getPlotForStudent(student: Student): Plot | undefined {
  return currentSession.value?.plotGroups.find(p => p.id === student.plotId)
}

function getStudentIndexInPlot(student: Student): number {
  if (!student.plotId) return -1
  return currentStudents.value
    .filter(s => s.plotId === student.plotId)
    .findIndex(s => s.id === student.id)
}

function getStudentPosition(student: Student, index: number): Position {
  if (student.plotId) {
    const plot = getPlotForStudent(student)
    if (plot) {
      const i = getStudentIndexInPlot(student)
      return {
        x: plot.x + 10,
        y: plot.y + 40 + i * 40,
      }
    }
  }

  // Position par défaut (colonne de droite)
  const margin = 20
  const baseX = Math.max(props.stageSize.width - 100 - margin, margin)
  return {
    x: baseX,
    y: 60 + index * 60,
  }
}

function updatePlotPosition(plot: Plot, event: DragKonvaEvent) {
  const pos = event.target.position()
  plot.x = pos.x
  plot.y = pos.y

  // Gestion de la zone de suppression
  const stage = event.target.getStage()
  const pointer = stage?.getPointerPosition()
  if (!pointer) return

  const margin = 80
  const thresholdX = props.stageSize.width - margin
  const thresholdY = props.stageSize.height - margin
  const isOverDeleteZone = pointer.x >= thresholdX && pointer.y >= thresholdY

  if (isOverDeleteZone) {
    plotBeingDeletedId.value = plot.id
  } else if (plotBeingDeletedId.value === plot.id) {
    plotBeingDeletedId.value = null
  }

  if (event.type === 'dragend') {
    if (isOverDeleteZone) {
      const plotHasStudents = currentStudents.value.some(s => s.plotId === plot.id)
      if (!plotHasStudents) {
        emit('delete-plot', plot.id)
      } else {
        alert("Ce plot contient des élèves. Vous devez les retirer avant de supprimer.")
      }
    }
    plotBeingDeletedId.value = null
  }
}

function updateStudentPosition(student: Student, event: DragKonvaEvent) {
  const group = event.target
  const pos = group.getAbsolutePosition()
  if (!pos) return

  const width = 40
  const height = 40
  const centerX = pos.x + width / 2
  const centerY = pos.y + height / 2

  const session = store.getCurrentSession()
  if (!session) return

  // Trouver le plot sous le student
  const plot = session.plotGroups.find(p =>
    centerX >= p.x && centerX <= p.x + 130 &&
    centerY >= p.y && centerY <= p.y + 130
  )

  // Créer une copie modifiable de l'étudiant
  const updatedStudent: Student = {
    ...student,
    x: pos.x,
    y: pos.y
  }

  if (plot) {
    // Assigner à un plot
    updatedStudent.plotId = plot.id

    // Ajouter l'étudiant au plot si ce n'est pas déjà fait
    if (!plot.students.includes(student.id)) {
      const plotIndex = session.plotGroups.findIndex(p => p.id === plot.id)
      if (plotIndex !== -1) {
        // On stocke seulement les IDs des étudiants dans le plot
        if (!session.plotGroups[plotIndex].students.includes(student.id)) {
          session.plotGroups[plotIndex].students.push(student.id)
        }
      }
    }
  } else {
    // Retirer du plot
    updatedStudent.plotId = null

    // Retirer l'étudiant de tous les plots
    session.plotGroups.forEach(plot => {
      plot.students = plot.students.filter(id => id !== student.id)
    })
  }

  // Mettre à jour l'étudiant dans le store
  const className = session.className
  const classStudents = store.state.classes[className] || []
  const studentIndex = classStudents.findIndex(s => s.id === student.id)

  if (studentIndex !== -1) {
    store.state.classes[className][studentIndex] = updatedStudent
  }

  highlightedPlotId.value = null
}

function limitPlotToBounds(pos: Position): Position {
  const plotWidth = 130
  const plotHeight = 130
  const maxX = props.stageSize.width - plotWidth
  const maxY = props.stageSize.height - plotHeight
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}

function limitStudentToBounds(pos: Position): Position {
  const studentWidth = 70
  const studentHeight = 40
  const padding = 30
  const maxX = props.stageSize.width - studentWidth - padding
  const maxY = props.stageSize.height - studentHeight - padding
  return {
    x: Math.max(padding, Math.min(pos.x, maxX)),
    y: Math.max(padding, Math.min(pos.y, maxY))
  }
}

function highlightPlotUnder(student: Student, event: DragKonvaEvent) {
  const group = event.target
  const pos = group.getAbsolutePosition()
  if (!pos) return

  const width = 40
  const height = 40
  const centerX = pos.x + width / 2
  const centerY = pos.y + height / 2

  const plot = currentSession.value?.plotGroups.find(p =>
    centerX >= p.x && centerX <= p.x + 130 &&
    centerY >= p.y && centerY <= p.y + 130
  )

  highlightedPlotId.value = plot ? plot.id : null
}

// Nouvelle fonction pour l'indicateur d'évaluation
function getEvaluationIndicatorConfig(plot: Plot) {
  const evaluations = plot.evaluations || {}
  const total = Object.keys(evaluations).length
  if (total === 0) return { x: 0, y: 0, width: 0, height: 0 }

  const trueCount = Object.values(evaluations).filter(v => v === true).length
  const ratio = trueCount / total

  return {
    x: plot.x + 10,
    y: plot.y + 10,
    width: 20,
    height: 20,
    fill: ratio > 0.66 ? '#4CAF50' : ratio > 0.33 ? '#FFC107' : '#F44336',
    cornerRadius: 5
  }
}
</script>

<style scoped>
.stage-wrapper {
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  background-color: #b85995;
  overflow: auto;
  position: relative;
  flex-grow: 1;
  height: 100%;
  overflow-x: hidden;
}

.konva-container canvas {
  touch-action: manipulation;
}
</style>
