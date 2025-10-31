<template>
  <v-dialog v-model="internalVisible" max-width="600px">
    <v-card>
      <!-- Titre avec bouton de fermeture -->
      <v-card-title class="text-h6 bg-primary text-white d-flex align-center justify-space-between">
        <span>Nouvelle session</span>

        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          size="default"
          class="close-btn"
          @click="internalVisible = false"
        />
      </v-card-title>

      <v-card-text class="bg-grey-lighten-4">
        <v-container>
          <!-- Nom de la session -->
          <v-text-field
            v-model="sessionName"
            label="Nom de la session"
            placeholder="Ex: TP1 - Travail en équipe"
            required
            :rules="[(v: any) => !!v || 'Le nom est requis']"
          />

          <!-- Sélection de la classe -->
          <v-radio-group v-model="selectedClass" label="Sélectionnez une classe">
            <v-radio
              v-for="(className, index) in classes"
              :key="index"
              :value="index"
              :label="className"
            />
          </v-radio-group>

          <!-- Sélection des compétences -->
          <v-list-subheader class="mt-4">Compétences à évaluer</v-list-subheader>
          <v-checkbox
            v-for="comp in competences"
            :key="comp.id"
            v-model="selectedCompetenceIds"
            :value="comp.id"
            :label="comp.libelle_court"
            hide-details
            class="mb-2"
          />
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="grey" @click="cancel">Annuler</v-btn>
        <v-btn variant="text" color="primary" @click="handleCreate">Créer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Competence } from '@/models'

const props = defineProps({
  visible: Boolean,
  classes: Array as () => string[],
  competences: Array as () => Competence[]
})

const emit = defineEmits(['update:visible', 'create'])

// Gestion de la visibilité
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const sessionName = ref('')
const selectedClass = ref(0)
const selectedCompetenceIds = ref<number[]>([])

watch(internalVisible, (visible) => {
  if (visible && props.competences) {
    selectedCompetenceIds.value = props.competences.map(c => c.id)
  }
})
function cancel() {
  internalVisible.value = false
}

function handleCreate() {
  if (!sessionName.value || selectedClass.value === undefined) {
    alert('Veuillez remplir tous les champs')
    return
  }

  emit('create', {
    className: props.classes?.[selectedClass.value],
    sessionName: sessionName.value,
    competenceIds: selectedCompetenceIds.value
  })

  // Réinitialiser le formulaire
  sessionName.value = ''
  selectedCompetenceIds.value = []
}
</script>

<style scoped>
.close-btn {
  background-color: rgba(255, 255, 255, 0.25); 
  border-radius: 50%;
  transition: background-color 0.2s ease;
  margin-right: 4px;
}

.close-btn:active {
  background-color: rgba(255, 255, 255, 0.35);
}
</style>
