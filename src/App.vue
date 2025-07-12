<template>
  <div id="app">
    <h1>Plan de TP - Drag and Drop</h1>
    <select v-model="selectedClass" @change="loadStudents">
      <option disabled value="">Choisir une classe</option>
      <option v-for="(students, className) in classes" :key="className" :value="className">
        {{ className }}
      </option>
    </select>
    <button @click="addPlot">Ajouter un plot</button>

    <Konvaboard :plots="plots" :students="students" :avatar-image="avatarImage" :stage-size="stageSize"
      @update:plots="plots = $event" @update:students="students = $event" />

  </div>
</template>

<script>
import classData from './data/classes.json'
import avatarSrc from './assets/duck-icon.svg'
import Konvaboard from './components/Konvaboard.vue'

export default {
  components: {
    Konvaboard
  },

  data() {
    return {
      avatarImage: null,

      stageSize: {
        width: 800,
        height: 600,
      },
      plots: [
        { id: 1, x: 100, y: 100, name: 'Plot A' },
        { id: 2, x: 300, y: 100, name: 'Plot B' },
      ],
      nextPlotId: 3,
      classes: classData,
      selectedClass: '',
      students: [],
      highlightedPlotId: null
    }
  },
  methods: {
    getAvatarImage(student) {
      return this.avatarImage
    },
    addPlot() {
      const id = this.nextPlotId
      const name = `Plot ${String.fromCharCode(64 + id)}` // 65 = 'A'
      this.plots.push({
        id,
        name,
        x: 100 + id * 50, // position initiale automatique
        y: 200
      })
      this.nextPlotId++
    },
    loadStudents() {
      if (!this.avatarImage) {
        // Attendre que l’image soit chargée
        setTimeout(() => this.loadStudents(), 100)
        return
      }
      const baseX = this.stageSize.width - 150 // à droite de ton stage
      const baseY = 50
      this.students = this.classes[this.selectedClass].map((student, index) => ({
        ...student,
        x: baseX,                // à droite de l’écran
        y: baseY + index * 40,   // empilés verticalement
        plotId: null             // sur la touche
      }))
    },
    resizeStage() {
      const wrapper = document.querySelector('.stage-wrapper')
      const padding = 20
      const width = wrapper?.clientWidth || window.innerWidth
      const height = window.innerHeight - wrapper?.offsetTop - padding

      this.stageSize.width = width
      this.stageSize.height = height
    },

  },
  mounted() {
    const img = new window.Image()
    img.src = avatarSrc
    img.onload = () => {
      this.avatarImage = img
    }

    window.addEventListener('resize', this.resizeStage)
    this.resizeStage()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeStage)
  },


}
</script>
