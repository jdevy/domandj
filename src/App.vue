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
    <v-stage :config="stageConfig">
      <v-layer>
        <!-- Plots -->
        <v-group v-for="plot in plots" :key="plot.id" :config="{ x: plot.x, y: plot.y, draggable: true }"
          @dragmove="updatePlotPosition(plot, $event)">
          <v-rect :config="{ width: 130, height: 130, fill: '#ccc', stroke: '#000' }" />
          <v-text :config="{ text: plot.name, fontSize: 14, x: 85, y: 5 }" />
        </v-group>

        <!-- Élèves  -->
        <v-group v-for="(student, index) in students" :key="student.id" :config="getStudentPosition(student, index)"
          :draggable="true" @dragend="updateStudentPosition(student, $event)">
          <v-image v-if="avatarImage"
            :config="{ image: avatarImage, width: 40, height: 40, offset: { x: 30, y: 20 } }" />
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

<script>
import classData from './data/classes.json'
import avatarSrc from './assets/duck-icon.svg'

export default {
  data() {
    return {
      avatarImage: null,

      stageConfig: {
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
      students: []
    }
  },
  methods: {
    getAvatarImage(student) {
      return this.avatarImage
    },
    getStudentPosition(student, index) {
      if (student.plotId) {
        const plot = this.plots.find(p => p.id === student.plotId)
        const i = this.students.filter(s => s.plotId === student.plotId).indexOf(student)
        return {
          x: plot.x + 10,
          y: plot.y + 40 + i * 40,
        }
      } else {
        const baseX = this.stageConfig.width - 150 // touche à droite
        return {
          x: baseX,
          y: 50 + index * 60,
        }
      }
    },
    updatePlotPosition(plot, event) {
      const pos = event.target.position()
      plot.x = pos.x
      plot.y = pos.y
    },
    updateStudentPosition(student, event) {
      const x = event.target.getAbsolutePosition().x
      const y = event.target.getAbsolutePosition().y

      // Trouver le plot en dessous
      const plot = this.plots.find(p =>
        x >= p.x &&
        x <= p.x + 100 &&
        y >= p.y &&
        y <= p.y + 100
      )

      if (plot) {
        student.plotId = plot.id
      } else {
        student.plotId = null
        student.x = x
        student.y = y
      }
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
      const baseX = 600 // à droite de ton stage
      const baseY = 50
      this.students = this.classes[this.selectedClass].map((student, index) => ({
        ...student,
        x: baseX,                // à droite de l’écran
        y: baseY + index * 40,   // empilés verticalement
        plotId: null             // sur la touche
      }))
    },
    resizeStage() {
      this.stageConfig.width = window.innerWidth
      this.stageConfig.height = window.innerHeight - 100
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
