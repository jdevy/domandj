<template>
  <div id="app">
    <h1>Plan de TP - Drag and Drop</h1>

    <div class="class-selector">
      <span v-for="(students, className) in classes" :key="className"
        :class="['class-chip', { active: selectedClass === className }]" @click="selectClass(className)">
        {{ className }}
      </span>
    </div>

    <div class="stage-container stage-position" ref="stageContainer">

      <Konvaboard :plots="plots" :students="students" :avatar-image="avatarImage" :stage-size="stageSize"
        @update:plots="plots = $event" 
        @update:students="students = $event" 
        @delete-plot="deletePlot"
        @open-evaluation="openEvaluation" />

      <button class="round-icon-btn plus-btn bottom-left" @click="addPlot">
        <LucidePlus size="24" />
      </button>

      <div class="round-icon-btn trash-zone bottom-right">
        <LucideTrash size="24" />
      </div>
    </div>

    <Evaluation :visible="showEvalModal" @close="showEvalModal = false">
      <p>Évaluation du plot : <strong>{{ currentPlot?.name }}</strong></p>
    </Evaluation>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, nextTick } from 'vue'
import classData from './data/classes.json'
import avatarSrc from './assets/duck-icon.svg'
import Konvaboard from './components/Konvaboard.vue'
import Evaluation from './components/Evaluation.vue'

// Données réactives
const avatarImage = ref(null)
const stageContainer = ref<HTMLElement | null>(null)
const showEvalModal = ref(false)
const currentPlot = ref(null)

const stageSize = reactive({
  width: window.innerWidth,
  height: window.innerHeight
})

const plots = ref([
  { id: 1, x: 100, y: 100, name: 'Plot A' },
  { id: 2, x: 300, y: 100, name: 'Plot B' }
])

const nextPlotId = ref(3)
const classes = classData
const selectedClass = ref('')
const students = ref([])
const highlightedPlotId = ref(null)

// Méthodes
function selectClass(className) {
  selectedClass.value = className
  loadStudents()
}

function addPlot() {
  const id = nextPlotId.value
  const name = `Plot ${String.fromCharCode(64 + id)}`
  plots.value.push({
    id,
    name,
    x: 100 + id * 20,
    y: 200 + id * 20
  })
  nextPlotId.value++
}

function deletePlot(plotId) {
  plots.value = plots.value.filter(p => p.id !== plotId)
}

function loadStudents() {
  if (!avatarImage.value) {
    setTimeout(() => loadStudents(), 100)
    return
  }

  const baseX = stageSize.width - 150
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

function openEvaluation(plot) {
  currentPlot.value = plot
  showEvalModal.value = true
}

// Cycle de vie
onMounted(() => {
  const img = new window.Image()
  img.src = avatarSrc
  img.onload = () => {
    avatarImage.value = img
  }

  nextTick(() => {
    resizeStage()
    window.addEventListener('resize', resizeStage)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeStage)
})
</script>
