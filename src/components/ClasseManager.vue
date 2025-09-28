<template>
  <v-dialog v-model="visible" max-width="700">
    <v-card>
      <v-card-title class="text-h6 bg-primary text-white">
        Gestion des classes
      </v-card-title>
      <v-card-text class="bg-grey-lighten-4">
        <!-- Liste des classes -->
        <v-expansion-panels>
          <v-expansion-panel v-for="(students, className) in store.state.classes" :key="className">
            <v-expansion-panel-title hide-actions>
              <span class="class-title">{{ className }}</span>
              <v-spacer />
              <v-btn icon="mdi-delete" color="error" size="small" @click.stop="deleteClass(className)" />
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <!-- Élèves existants -->
                <v-list-item v-for="(student, i) in students" :key="student.id">
                  <v-text-field
                    v-model="student.name"
                    placeholder="Nom de l'élève"
                    variant="outlined"
                    hide-details
                    class="student-field"
                    @blur="saveStudent(className, i)"
                  >
                    <template #append>
                      <div class="student-action" @click="deleteStudent(className, i)">
                        <v-icon size="20" color="error">mdi-close</v-icon>
                      </div>
                    </template>
                  </v-text-field>
                </v-list-item>
                <!-- Nouvel élève -->
                <v-list-item class="new-student-item">
                  <v-text-field
                    v-model="newStudent[className]"
                    placeholder="Nouvel élève"
                    variant="outlined"
                    hide-details
                    class="student-field"
                    @keyup.enter="addStudentFromField(className)"
                  >
                    <template #append>
                      <div class="student-action" @click="addStudentFromField(className)">
                        <v-icon size="24" color="success">mdi-plus-thick</v-icon>
                      </div>
                    </template>
                  </v-text-field>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-divider class="my-4" />
        <!-- Ajouter une nouvelle classe -->
        <v-list-item class="new-student-item">
          <v-text-field
            v-model="newClassName"
            placeholder="Nouvelle classe"
            variant="outlined"
            hide-details
            class="student-field"
            @keyup.enter="addClass"
          >
            <template #append>
              <div class="student-action" @click="addClass">
                <v-icon size="34" color="green-darken-2" class="add-icon">mdi-plus</v-icon>
              </div>
            </template>
          </v-text-field>
        </v-list-item>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="visible = false">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useEvaluationStore } from "@/stores/evaluationStore"
import debounce from "lodash.debounce"

// Utilisation du nouveau store
const store = useEvaluationStore()
const visible = defineModel<boolean>('visible')
const newClassName = ref("")
const newStudent = ref<Record<string, string>>({})

// Initialiser newStudent pour chaque classe existante
watch(() => store.state.classes, (newClasses) => {
  Object.keys(newClasses).forEach(className => {
    if (!newStudent.value[className]) {
      newStudent.value[className] = ""
    }
  })
}, { immediate: true, deep: true })

// Sauvegarde automatique avec debounce
watch(
  () => store.state.classes,
  debounce(() => {
    // La sauvegarde est déjà gérée par le watch dans le store
  }, 1000),
  { deep: true }
)

function addClass() {
  if (!newClassName.value.trim()) return
  if (store.state.classes[newClassName.value]) {
    alert("Cette classe existe déjà.")
    return
  }

  // Ajouter la nouvelle classe au store
  store.state.classes[newClassName.value] = []
  newClassName.value = ""
}

function deleteClass(name: string) {
  if (!confirm(`Supprimer la classe "${name}" ?`)) return

  // Supprimer la classe du store
  delete store.state.classes[name]

  // Supprimer aussi les sessions associées à cette classe
  store.state.sessions = store.state.sessions.filter(session => session.className !== name)

  // Si la session courante est supprimée, en sélectionner une autre
  if (store.state.currentSessionId) {
    const currentSession = store.state.sessions.find(s => s.id === store.state.currentSessionId)
    if (currentSession?.className === name) {
      store.state.currentSessionId = store.state.sessions[0]?.id || null
    }
  }
}

function saveStudent(className: string, index: number) {
  // Le store est réactif, donc la modification est automatiquement sauvegardée
  // Pas besoin de faire quoi que ce soit de plus
}

function addStudent(className: string) {
  const newStudentId = Date.now()
  store.state.classes[className].push({
    id: newStudentId,
    name: "",
    x: 0,
    y: 0,
    plotId: null
  })
}

function deleteStudent(className: string, index: number) {
  if (!confirm("Supprimer cet élève ?")) return
  store.state.classes[className].splice(index, 1)
}

function addStudentFromField(className: string) {
  const name = newStudent.value[className]?.trim()
  if (!name) return

  const newStudentId = Date.now()
  store.state.classes[className].push({
    id: newStudentId,
    name: name,
    x: 0,
    y: 0,
    plotId: null
  })

  newStudent.value[className] = ""
}
</script>

<style scoped>
.student-field {
  margin-top: 6px;
}

.student-field .v-field__append-inner {
  display: flex;
  align-items: center;
}

.student-action {
  margin: 0;
  padding: 0;
  min-width: 40px;
}

.new-student-item {
  margin-top: 20px;
}

.class-title {
  font-size: 1.2rem;
}

.add-icon {
  transition: color 0.2s ease;
}

.add-icon:hover {
  color: #2e7d32;
  cursor: pointer;
}
</style>
