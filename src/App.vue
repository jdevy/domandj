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

    <div class="stage-wrapper">
      <v-stage :config="stageConfig">
        <v-layer>
          <!-- Plots -->
          <v-group v-for="plot in plots" :key="plot.id"
            :config="{ x: plot.x, y: plot.y, draggable: true, dragBoundFunc: pos => limitPlotToBounds(pos) }"
            @dragmove="updatePlotPosition(plot, $event)">
            <v-rect :config="{
              width: 130, height: 130, fill: highlightedPlotId === plot.id ? '#8ef0aa' : '#ccc', stroke: '#000', shadowColor: highlightedPlotId === plot.id ? '#666' : '',
              shadowBlur: highlightedPlotId === plot.id ? 8 : 0
            }" />
            <v-text :config="{ text: plot.name, fontSize: 14, x: 85, y: 5 }" />
          </v-group>

          <!-- Élèves  -->
          <v-group v-for="(student, index) in students" :key="student.id"
            :config="{ ...getStudentPosition(student, index), draggable: true, dragBoundFunc: pos => limitStudentToBounds(pos) }"
            @dragmove="highlightPlotUnder(student, $event)" @dragend="updateStudentPosition(student, $event)">
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
      students: [],
      highlightedPlotId: null
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
        const margin = 20
        const baseX = Math.max(this.stageConfig.width - 130 - margin, margin)

        return {
          x: baseX,
          y: 60 + index * 60,
        }
      }
    },
    updatePlotPosition(plot, event) {
      const pos = event.target.position()
      plot.x = pos.x
      plot.y = pos.y
    },
    updateStudentPosition(student, event) {
      const group = event.target;
      const pos = group.getAbsolutePosition();
      if (!pos) return;
      const width = 40;
      const height = 40;

      try {
        const group = event.target;
        const pos = group.getAbsolutePosition();
        const width = 40;
        const height = 40;

        const centerX = pos.x + width / 2;
        const centerY = pos.y + height / 2;

        const plot = this.plots.find(p =>
          centerX >= p.x &&
          centerX <= p.x + 130 &&
          centerY >= p.y &&
          centerY <= p.y + 130
        );

        if (plot) {
          student.plotId = plot.id;
        } else {
          student.plotId = null;
          student.x = pos.x;
          student.y = pos.y;
        }

        this.highlightedPlotId = null;
      } catch (e) {
        console.error("Drag end error:", e);
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
      const wrapper = document.querySelector('.stage-wrapper')
      const padding = 20
      const width = wrapper?.clientWidth || window.innerWidth
      const height = window.innerHeight - wrapper?.offsetTop - padding

      this.stageConfig.width = width
      this.stageConfig.height = height
    },
    limitPlotToBounds(pos) {
      const plotWidth = 130
      const plotHeight = 130

      const maxX = this.stageConfig.width - plotWidth
      const maxY = this.stageConfig.height - plotHeight

      const x = Math.max(0, Math.min(pos.x, maxX))
      const y = Math.max(0, Math.min(pos.y, maxY))

      return { x, y }
    },
    limitStudentToBounds(pos) {
      const studentWidth = 70
      const studentHeight = 40

      const padding = 30

      const maxX = this.stageConfig.width - studentWidth - padding
      const maxY = this.stageConfig.height - studentHeight - padding

      const x = Math.max(padding, Math.min(pos.x, maxX))
      const y = Math.max(padding, Math.min(pos.y, maxY))

      return { x, y }
    },
    highlightPlotUnder(student, event) {
      const group = event.target;
      const pos = group.getAbsolutePosition();
      const width = 40;  // largeur approximative de l’élève (ou calcule dynamiquement si besoin)
      const height = 40; // idem

      const centerX = pos.x + width / 2;
      const centerY = pos.y + height / 2;

      const plot = this.plots.find(p =>
        centerX >= p.x &&
        centerX <= p.x + 130 &&
        centerY >= p.y &&
        centerY <= p.y + 130
      );

      this.highlightedPlotId = plot ? plot.id : null;
    }

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
