<template>
  <v-dialog v-model="visible" max-width="700">
    <v-card>
      <v-card-title class="text-h6 bg-primary text-white">
        Gestion des classes
      </v-card-title>

      <v-card-text class="bg-grey-lighten-4">
        <!-- Liste des classes -->
        <v-expansion-panels>
          <v-expansion-panel v-for="(students, className) in classes" :key="className">
            <v-expansion-panel-title hide-actions>
              <span class="class-title">{{ className }}</span>
              <v-spacer />
              <v-btn icon="mdi-delete" color="error" size="small" @click.stop="deleteClass(className)" />
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-list density="compact">
                <!-- Élèves existants -->
                <v-list-item v-for="(student, i) in students" :key="student.id">
                  <v-text-field v-model="student.name" placeholder="Nom de l'élève" variant="outlined" hide-details
                    class="student-field">
                    <template #append>
                      <div class="student-action" @click="deleteStudent(className, i)">
                        <v-icon size="20" color="error">mdi-close</v-icon>
                      </div>
                    </template>
                  </v-text-field>
                </v-list-item>

                <!-- Nouvel élève -->
                <v-list-item class="new-student-item">
                  <v-text-field v-model="newStudent[className]" placeholder="Nouvel élève" variant="outlined"
                    hide-details class="student-field" @keyup.enter="addStudentFromField(className)">
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
        <!-- Ajouter une nouvelle classe -->
        <v-list-item class="new-student-item">
          <v-text-field v-model="newClassName" placeholder="Nouvelle classe" variant="outlined" hide-details
            class="student-field" @keyup.enter="addClass">
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
import { classesStore, saveClasses } from "@/services/classeStorage"
import debounce from "lodash.debounce"

// DefineModel simplifie le v-model
const visible = defineModel<boolean>('visible')

const classes = classesStore
const newClassName = ref("")
const newStudent = ref<Record<string, string>>({})


watch(
  classes,
  debounce(() => {
    saveClasses()
  }, 1000),
  { deep: true }
)

function addClass() {
  if (!newClassName.value.trim()) return
  if (classes[newClassName.value]) {
    alert("Cette classe existe déjà.")
    return
  }
  classes[newClassName.value] = []
  saveClasses()
  newClassName.value = ""
}

function deleteClass(name: string) {
  if (!confirm(`Supprimer la classe "${name}" ?`)) return
  delete classes[name]
  saveClasses()
}

function addStudent(className: string) {
  classes[className].push({ id: Date.now(), name: "" })
  console.log("➕ Élève ajouté dans ClasseManager", className, classes[className])
  saveClasses()
}

function deleteStudent(className: string, index: number) {
  if (!confirm("Supprimer cet élève ?")) return
  classes[className].splice(index, 1)
  saveClasses()
}

function addStudentFromField(className: string) {
    console.log("999 Élève ajouté dans ClasseManager", className, classes[className])

  const name = newStudent.value[className]?.trim()
  if (!name) return
  classes[className].push({ id: Date.now(), name })
  newStudent.value[className] = ""
  saveClasses()
}
</script>

<style scoped>
.student-field {
  margin-top: 6px;
  /* espace au-dessus */
}

.student-field .v-field__append-inner {
  display: flex;
  align-items: center;
  /* centre verticalement bouton/croix */
}

.student-action {
  margin: 0;
  padding: 0;
  min-width: 40px;
  /* même largeur pour alignement */
}

.new-student-item {
  margin-top: 20px;
  /* espace léger au-dessus */
}

.class-title {
  font-size: 1.2rem;
}

.add-icon {
  transition: color 0.2s ease;
}

.add-icon:hover {
  color: #2e7d32;
}
</style>
