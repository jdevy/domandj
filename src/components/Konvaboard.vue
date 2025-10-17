<template>
  <div class="stage-wrapper konva-container">
    <v-stage :config="stageSize">
      <v-layer>
        <!-- Plots -->
        <v-group v-for="plot in plotConfigs" :key="plot.id" :config="plot.config"
          @dragmove="updatePlotPositionById(plot.id, $event)" @dragend="updatePlotPositionById(plot.id, $event)">
          <v-rect :config="plot.rectStyle" />
          <v-text :config="plot.textStyle" :listening="false" />
          <template v-if="plot.hasStudents">
            <v-group :config="{ ...defaultGroupPosition(110, 100), listening: true }"
              @pointerdown="handleEvaluationClickById(plot.id, $event)">
              <v-rect :config="{ x: 0, y: 0, width: 50, height: 50, fill: 'transparent' }" />
              <v-rect :config="evaluationButtonRect" />
              <v-text :config="evaluationButtonText" />
            </v-group>
          </template>
        </v-group>



        <!-- Élèves -->
        <v-group v-for="student in studentConfigs" :key="`${student.id}-${currentSession?.id}`" :config="student.config"
          @dragmove="highlightPlotUnder($event)" @dragend="updateStudentPositionById(student.id, $event)">
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
let lastHighlightedId: number | null = null

// Store helpers
const currentSession = computed(() => store.getCurrentSession())
const currentStudents = computed(() => {
  if (!currentSession.value) return []
  return store.state.classes[currentSession.value.className] || []
})

const plotConfigs = computed(() => {
  if (!currentSession.value) return []
  return currentSession.value.plotGroups.map(plot => ({
    id: plot.id,
    config: {
      x: plot.x,
      y: plot.y,
      draggable: true,
      dragBoundFunc: limitPlotToBounds
    },
    rectStyle: getPlotRectStyle(plot, highlightedPlotId.value === plot.id, plotBeingDeletedId.value === plot.id),
    textStyle: { text: plot.name, ...getPlotTextStyle(plot) },
    hasStudents: hasStudentsInPlot(plot)
  }))
})

const studentConfigs = computed(() => {
  return currentStudents.value.map((student, index) => {
    const pos = studentPositions.value[student.id] || getStudentPosition(student, index)
    return {
      id: student.id,
      config: {
        ...pos,
        draggable: true,
        dragBoundFunc: limitStudentToBounds
      },
      name: student.name
    }
  })
})
function updatePlotPositionById(plotId: number, event: DragKonvaEvent) {
  const plot = currentSession.value?.plotGroups.find(p => p.id === plotId)
  if (!plot) return
  updatePlotPosition(plot, event)
}

function handleEvaluationClickById(plotId: number, event: any) {
  const plot = currentSession.value?.plotGroups.find(p => p.id === plotId)
  if (!plot) return
  handleEvaluationClick(plot, event)
}

function updateStudentPositionById(studentId: number, event: DragKonvaEvent) {
  const student = currentStudents.value.find(s => s.id === studentId)
  if (!student) return
  updateStudentPosition(student, event)
}
// --- Méthodes utilitaires ---
function hasStudentsInPlot(plot: Plot): boolean {
  return plot.students.length > 0
}

function handleEvaluationClick(plot: Plot, evt: any) {
  evt.cancelBubble = true
  emit('open-evaluation', { ...plot })
}

const plotZones = computed(() => {
  if (!currentSession.value) return [];
  return currentSession.value.plotGroups.map(p => ({
    id: p.id,
    left: p.x,
    right: p.x + 130,
    top: p.y,
    bottom: p.y + 130,
  }));
});
function getPlotUnderStudent(pos: Position): Plot | null {
  if (!currentSession.value) return null;
  const centerX = pos.x + 20; // Moitié de la largeur d'un élève
  const centerY = pos.y + 20; // Moitié de la hauteur d'un élève
  const zone = plotZones.value.find(z =>
    centerX >= z.left && centerX <= z.right &&
    centerY >= z.top && centerY <= z.bottom
  );
  return zone ? currentSession.value!.plotGroups.find(p => p.id === zone.id) || null : null;
}

function highlightPlotUnder(event: DragKonvaEvent) {
  if (event.type !== 'dragmove') return;

  const pos = event.target.getAbsolutePosition()
  const plot = getPlotUnderStudent(pos)
  const newId = plot ? plot.id : null

  if (newId !== lastHighlightedId) {
    highlightedPlotId.value = newId
    lastHighlightedId = newId
  }
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
    const plotHasStudents = plot.students.length > 0
    if (!plotHasStudents) {
      emit('delete-plot', plot.id)
    } else {
      alert("Ce plot contient des élèves. Vous devez les retirer avant de supprimer.")
    }
    plotBeingDeletedId.value = null
  }
}

// --- Gestion du drag des élèves ---
function updateStudentPosition(student: Student, event: DragKonvaEvent) {
  if (event.type !== 'dragend') return // Ne fait rien pendant le mouvement

  const pos = event.target.getAbsolutePosition()
  if (!pos) return
  const session = store.getCurrentSession()
  if (!session) return

  // Plot sous la position actuelle du student
  const newPlot = getPlotUnderStudent(pos)
  // Plot actuel dans lequel l’élève se trouve déjà (si existant)
  const currentPlot = session.plotGroups.find(p => p.students.includes(student.id))

  // Si rien n’a changé → on ne fait rien
  if (newPlot?.id === currentPlot?.id) {
    highlightedPlotId.value = null
    return
  }

  // S’il était déjà sur un plot → on le retire
  if (currentPlot) {
    store.removeStudentFromPlot(session.id, student.id, currentPlot.id)
  }

  // S’il est maintenant sur un nouveau plot → on l’ajoute
  if (newPlot) {
    store.moveStudentToPlot(session.id, student.id, newPlot.id)
  }

  highlightedPlotId.value = null
}


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
const studentPositions = computed(() => {
  const session = currentSession.value
  if (!session) return {}

  const positions: Record<number, { x: number; y: number }> = {}

  session.plotGroups.forEach(plot => {
    plot.students.forEach((studentId, index) => {
      // Vérifie si la position a déjà été calculée (évite les doublons)
      if (!positions[studentId]) {
        positions[studentId] = {
          x: plot.x + 10,
          y: plot.y + 40 + index * 40
        };
      }
    });
  });
  return positions;
})

function getStudentPosition(student: Student, index: number): Position {
  // Si la position est déjà calculée dans le computed (élève assigné à un plot)
  const position = studentPositions.value[student.id]
  if (position) return position

  // Élève non assigné à un plot → on les range à droite de la scène
  const session = currentSession.value
  const unassigned = currentStudents.value.filter(s =>
    !session?.plotGroups.some(p => p.students.includes(s.id))
  )

  const i = unassigned.findIndex(s => s.id === student.id)
  const posIndex = i >= 0 ? i : index

  const margin = 20
  const baseX = Math.max(props.stageSize.width - 100 - margin, margin)

  return { x: baseX, y: 60 + posIndex * 60 }
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
  will-change: transform;
}
</style>
