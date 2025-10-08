<template>
  <div class="stage-wrapper konva-container">
    <v-stage :config="stageSize">
      <v-layer>
        <!-- Plots -->
        <v-group v-for="plot in currentSession?.plotGroups" :key="plot.id" :config="{
          x: plot.x,
          y: plot.y,
          draggable: true,
          dragBoundFunc: limitPlotToBounds
        }" @dragmove="updatePlotPosition(plot, $event)" @dragend="updatePlotPosition(plot, $event)">
          <v-rect :config="getPlotRectStyle(plot, highlightedPlotId === plot.id, plotBeingDeletedId === plot.id)" />
          <v-text :config="{ text: plot.name, ...getPlotTextStyle(plot) }" />

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
        <v-group v-for="(student, index) in currentStudents" :key="student.id" :config="{
          ...getStudentPosition(student, index),
          draggable: true,
          dragBoundFunc: limitStudentToBounds
        }" @dragmove="highlightPlotUnder(student, $event)" @dragend="updateStudentPosition(student, $event)">
          <v-image v-if="avatarImage" :config="getStudentAvatarStyle(avatarImage)" />
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
  evaluationButtonRect,
  evaluationButtonText,
  defaultGroupPosition,
  getPlotRectStyle,
  getPlotTextStyle,
  getStudentAvatarStyle,
  getStudentLabelRectStyle,
  getStudentLabelTextStyle
} from '@/styles/konvaStyles'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { debounce } from 'lodash'

// Props
const props = defineProps({
  stageSize: { type: Object, required: true },
  avatarImage: { type: Object as () => HTMLImageElement | null, required: false }
})

// Événements
const emit = defineEmits(['delete-plot', 'open-evaluation'])

// State local
const highlightedPlotId = ref<number | null>(null)
const plotBeingDeletedId = ref<number | null>(null)
const store = useEvaluationStore()

// Store helpers
const currentSession = computed(() => store.getCurrentSession())
const currentStudents = computed(() => {
  if (!currentSession.value) return []
  return store.state.classes[currentSession.value.className] || []
})

// --- Méthodes ---
function handleEvaluationClick(plot: Plot, evt: any) {
  evt.cancelBubble = true
  emit('open-evaluation', { ...plot })
}

function getPlotUnderStudent(pos: Position): Plot | null {
  if (!currentSession.value) return null
  const width = 40
  const height = 40
  const centerX = pos.x + width / 2
  const centerY = pos.y + height / 2

  return currentSession.value.plotGroups.find(p =>
    centerX >= p.x && centerX <= p.x + 130 &&
    centerY >= p.y && centerY <= p.y + 130
  ) || null
}

function highlightPlotUnder(student: Student, event: DragKonvaEvent) {
  const pos = event.target.getAbsolutePosition()
  const plot = getPlotUnderStudent(pos)
  highlightedPlotId.value = plot ? plot.id : null
}

// --- Gestion du drag des plots ---
function updatePlotPosition(plot: Plot, event: DragKonvaEvent) {
  const pos = event.target.position()
  plot.x = pos.x
  plot.y = pos.y

  const stage = event.target.getStage()
  const pointer = stage?.getPointerPosition()
  if (!pointer) return

  const margin = 80
  const thresholdX = props.stageSize.width - margin
  const thresholdY = props.stageSize.height - margin
  const isOverDeleteZone = pointer.x >= thresholdX && pointer.y >= thresholdY

  plotBeingDeletedId.value = isOverDeleteZone ? plot.id : (plotBeingDeletedId.value === plot.id ? null : plotBeingDeletedId.value)

  if (event.type === 'dragend' && isOverDeleteZone) {
    const plotHasStudents = currentStudents.value.some(s => s.plotId === plot.id)
    if (!plotHasStudents) {
      emit('delete-plot', plot.id)
    } else {
      alert("Ce plot contient des élèves. Vous devez les retirer avant de supprimer.")
    }
    plotBeingDeletedId.value = null
  }
}

// --- Gestion du drag des élèves ---
const updateStudentPosition = debounce((student: Student, event: DragKonvaEvent) => {
  const pos = event.target.getAbsolutePosition()
  if (!pos) return

  const session = store.getCurrentSession()
  if (!session) return

  const plot = getPlotUnderStudent(pos)

  if (plot) {
    store.moveStudentToPlot(session.id, student.id, plot.id)
  } else if (student.plotId) {
    store.removeStudentFromPlot(session.id, student.id, student.plotId)
  }

  // Mise à jour des coordonnées x/y
  const classStudents = store.state.classes[session.className]
  const studentIndex = classStudents.findIndex(s => s.id === student.id)
  if (studentIndex !== -1) {
    classStudents[studentIndex] = { ...classStudents[studentIndex], x: pos.x, y: pos.y }
  }

  highlightedPlotId.value = null
}, 16)

// --- Limites pour les plots et élèves ---
function limitPlotToBounds(pos: Position): Position {
  const plotWidth = 130
  const plotHeight = 130
  return {
    x: Math.max(0, Math.min(pos.x, props.stageSize.width - plotWidth)),
    y: Math.max(0, Math.min(pos.y, props.stageSize.height - plotHeight))
  }
}

function limitStudentToBounds(pos: Position): Position {
  const studentWidth = 70
  const studentHeight = 40
  const padding = 30
  return {
    x: Math.max(padding, Math.min(pos.x, props.stageSize.width - studentWidth - padding)),
    y: Math.max(padding, Math.min(pos.y, props.stageSize.height - studentHeight - padding))
  }
}

// --- Calcul de position des élèves ---
function getPlotForStudent(student: Student): Plot | undefined {
  return currentSession.value?.plotGroups.find(p => p.id === student.plotId)
}

function getStudentIndexInPlot(student: Student): number {
  if (!student.plotId) return -1
  return currentStudents.value.filter(s => s.plotId === student.plotId).findIndex(s => s.id === student.id)
}

function getStudentPosition(student: Student, index: number): Position {
  const plot = getPlotForStudent(student)
  if (plot) {
    const i = getStudentIndexInPlot(student)
    return { x: plot.x + 10, y: plot.y + 40 + i * 40 }
  }

  // Sinon : élève non assigné -> positionner selon l'ordre des non-assignés
  const unassigned = currentStudents.value.filter(s => !s.plotId)
  const i = unassigned.findIndex(s => s.id === student.id)
  const posIndex = i >= 0 ? i : index

  const margin = 20
  const baseX = Math.max(props.stageSize.width - 100 - margin, margin)
  return { x: baseX, y: 60 + posIndex * 60 }
}

// --- Indicateur d'évaluation ---
function getEvaluationIndicatorConfig(plot: Plot) {
  const evaluations = plot.evaluations || {}
  const total = Object.keys(evaluations).length
  if (!total) return { x: 0, y: 0, width: 0, height: 0 }

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
