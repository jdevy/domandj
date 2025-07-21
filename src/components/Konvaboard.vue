<template>
    <div class="stage-wrapper">
        <v-stage :config="props.stageSize">
            <v-layer>
                <!-- Plots -->
                <v-group v-for="plot in props.plots" :key="plot.id"
                    :config="{ x: plot.x, y: plot.y, draggable: true, dragBoundFunc: limitPlotToBounds }"
                    @dragmove="updatePlotPosition(plot, $event)" @dragend="updatePlotPosition(plot, $event)">
                    <v-rect :config="{
                        width: 130, height: 130,
                        fill: plotBeingDeletedId === plot.id
                            ? '#e53935'
                            : (highlightedPlotId === plot.id ? '#8ef0aa' : '#dfefff'),
                        stroke: '#666', shadowColor: highlightedPlotId === plot.id ? '#666' : '',
                        shadowBlur: highlightedPlotId === plot.id ? 8 : 0
                    }" />
                    <v-text :config="{ text: plot.name, fontSize: 14, x: 85, y: 5 }" />

                    <!-- "Bouton" Évaluation -->
                    <template v-if="hasStudents(plot, props.students)">
                        <v-rect :config="{
                            x: 100, y: 100, width: 20, height: 20, fill: '#186efa', cornerRadius: 5,
                            stroke: '#fff', strokeWidth: 1, shadowBlur: 2, cursor: 'pointer'
                        }" @click="() => { emit('open-evaluation', plot) }" />
                        <v-text :config="{
                            text: 'i', x: 106, y: 103, fontSize: 14, fill: '#fff', fontStyle: 'bold'
                        }" />
                    </template>

                </v-group>

                <!-- Élèves  -->
                <v-group v-for="(student, index) in props.students" :key="student.id"
                    :config="{ ...getStudentPosition(student, index), draggable: true, dragBoundFunc: limitStudentToBounds }"
                    @dragmove="highlightPlotUnder(student, $event)" @dragend="updateStudentPosition(student, $event)">
                    <v-image v-if="props.avatarImage"
                        :config="{ image: props.avatarImage, width: 40, height: 40, offset: { x: 30, y: 20 } }" />
                    <!-- Étiquette prénom -->
                    <v-group>
                        <v-rect :config="{
                            x: 12, y: -10,
                            width: 70, height: 25,
                            fill: '#186efa', cornerRadius: 10
                        }" />
                        <v-text :config="{
                            text: student.name,
                            x: 25, y: -4,
                            fontSize: 14, fill: '#fff', width: 50, align: 'left'
                        }" />
                    </v-group>
                </v-group>
            </v-layer>
        </v-stage>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { hasStudents } from '@/services/plotService'
import type { Plot, Student, DragKonvaEvent, Position } from '@/models'

// Props
const props = defineProps<{
    students: Student[]
    plots: Plot[]
    avatarImage: HTMLImageElement | null
    stageSize: { width: number, height: number }
}>()

// Événements émis
const emit = defineEmits<{
    (e: 'update:plots', value: Plot[]): void
    (e: 'update:students', value: Student[]): void
    (e: 'delete-plot', id: number): void
    (e: 'open-evaluation', plot: Plot): void
}>()

// État local
const highlightedPlotId = ref<number | null>(null)
const plotBeingDeletedId = ref<number | null>(null)

// Méthodes
function getPlotForStudent(student: Student): Plot | undefined {
  return props.plots.find(p => p.id === student.plotId)
}

function getStudentIndexInPlot(student: Student): number {
  return props.students
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
        return { x: 0, y: 0 }
    } else {
        const margin = 20
        const baseX = Math.max(props.stageSize.width - 100 - margin, margin)

        return {
            x: baseX,
            y: 60 + index * 60,
        }
    }
}

function updatePlotPosition(plot: Plot, event: DragKonvaEvent) {
    const pos = event.target.position()
    plot.x = pos.x
    plot.y = pos.y

    // On récupère la position absolue du pointeur (curseur)
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
            const hasStudents = props.students.some(s => s.plotId === plot.id)
            if (!hasStudents) {
                emit('delete-plot', plot.id)
            } else {
                alert("Ce plot contient des élèves. Vous devez les retirer avant de supprimer.")
            }
        }

        // Toujours réinitialiser l’indicateur visuel
        plotBeingDeletedId.value = null
    }
}

function updateStudentPosition(student: Student, event: DragKonvaEvent) {
    const group = event.target
    const pos = group.getAbsolutePosition()
    if (!pos) return

    const width = 40
    const height = 40

    try {
        const centerX = pos.x + width / 2
        const centerY = pos.y + height / 2

        const plot = props.plots.find(p =>
            centerX >= p.x &&
            centerX <= p.x + 130 &&
            centerY >= p.y &&
            centerY <= p.y + 130
        )

        if (plot) {
            student.plotId = plot.id
        } else {
            student.plotId = null
            student.x = pos.x
            student.y = pos.y
        }

        highlightedPlotId.value = null
    } catch (e) {
        console.error("Drag end error:", e)
    }
}

function limitPlotToBounds(pos: Position): Position {
    const plotWidth = 130
    const plotHeight = 130

    const maxX = props.stageSize.width - plotWidth
    const maxY = props.stageSize.height - plotHeight

    const x = Math.max(0, Math.min(pos.x, maxX))
    const y = Math.max(0, Math.min(pos.y, maxY))

    return { x, y }
}

function limitStudentToBounds(pos: Position): Position {
    const studentWidth = 70
    const studentHeight = 40

    const padding = 30

    const maxX = props.stageSize.width - studentWidth - padding
    const maxY = props.stageSize.height - studentHeight - padding

    const x = Math.max(padding, Math.min(pos.x, maxX))
    const y = Math.max(padding, Math.min(pos.y, maxY))

    return { x, y }
}

function highlightPlotUnder(student: Student, event: DragKonvaEvent) {
    const group = event.target
    const pos = group.getAbsolutePosition()
    const width = 40
    const height = 40
    const plotSize = 130


    const centerX = pos.x + width / 2
    const centerY = pos.y + height / 2

    const plot: Plot | undefined = props.plots.find(p =>
        centerX >= p.x &&
        centerX <= p.x + plotSize &&
        centerY >= p.y &&
        centerY <= p.y + plotSize
    )

    highlightedPlotId.value = plot ? plot.id : null
}

</script>



<style scoped>
.stage-wrapper {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    border: 0px;
    background-color: #b85995;
    overflow: auto;
    position: relative;
    flex-grow: 1;
    height: 100%;
    overflow-x: hidden;
}
</style>