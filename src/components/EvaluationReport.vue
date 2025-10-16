<template>
  <v-dialog v-model="visible" max-width="1000px" scrollable>
    <v-card>
      <!-- 🔹 Titre : session + classe -->
      <v-card-title class="text-h6 bg-primary text-white d-flex justify-space-between align-center">
        <span>Rapport d’évaluation — {{ session.name }} ({{ session.className }})</span>
        <v-btn icon="mdi-close" variant="text" color="white" @click="visible = false" />
      </v-card-title>

      <v-card-text>
        <v-table dense fixed-header height="70vh">
          <thead>
            <tr>
              <th>Élève</th>
              <th v-for="comp in competencies" :key="comp.id">
                {{ comp.libelle_court }}
              </th>
              <th class="text-right">Note finale</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td class="student-column">{{ student.name }}</td>

              <!-- 🔹 Résultats par compétence -->
              <td
                v-for="comp in competencies"
                :key="comp.id"
                class="text-center"
              >
                {{ getCompetenceResult(student.id, comp.id) }}
              </td>

              <!-- 🔹 Calcul automatique de la note -->
              <td class="text-right font-weight-bold">
                {{ getFinalNote(student.id) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" @click="visible = false">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEvaluationStore } from '@/stores/evaluationStore'
import type { Session, Student, Competence } from '@/models'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])
const store = useEvaluationStore()

// 🔹 Liaison v-model
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const session = computed<Session>(() => store.getCurrentSession()!)
const students = computed<Student[]>(() =>
  store.state.classes[session.value.className] || []
)
const competencies = computed<Competence[]>(() =>
  store.state.competences.filter(c =>
    session.value.selectedCompetenceIds.includes(c.id)
  )
)

// 🔹 Retourne ✔️ ou ❌ pour chaque compétence
function getCompetenceResult(studentId: number, compId: number): string {
  const plot = session.value.plotGroups.find(p => p.students.includes(studentId))
  if (!plot) return '-'

  const val = plot.evaluations?.[compId]
  if (val === true) return '✔️'
  if (val === false) return '❌'
  return '–'
}

// 🔹 Calcule une note sur 20 selon les ❌
function getFinalNote(studentId: number): string {
  const total = competencies.value.length
  if (total === 0) return '–'

  let redCrosses = 0

  for (const comp of competencies.value) {
    const result = getCompetenceResult(studentId, comp.id)
    if (result === '❌') redCrosses++
  }

  const note = 20 - (redCrosses / total) * 20
  return note.toFixed(1)
}
</script>

<style scoped>
th, td {
  border-bottom: 1px solid #ccc;
  padding: 4px 8px;
}
.font-weight-bold {
  font-weight: 600;
}
.student-column {
  background-color: #f5f5f5; 
  font-weight: 500;
}
</style>
