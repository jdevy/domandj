<template>
  <v-dialog v-model="internalVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">Nouvelle session</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <!-- Nom de la session -->
          <v-text-field v-model="sessionName" label="Nom de la session" placeholder="Ex: TP1 - Travail en équipe"
            required :rules="[(v: any) => !!v || 'Le nom est requis']"></v-text-field>

          <!-- Sélection de la classe -->
          <v-radio-group v-model="selectedClass" label="Sélectionnez une classe">
            <v-radio v-for="(className, index) in classes" :key="index" :value="index" :label="className"></v-radio>
          </v-radio-group>


          <!-- Sélection des compétences -->
          <v-list-subheader class="mt-4">Compétences à évaluer</v-list-subheader>
          <v-checkbox v-for="comp in competences" :key="comp.id" v-model="selectedCompetenceIds" :value="comp.id"
            :label="comp.libelle_court" hide-details class="mb-2"></v-checkbox>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="cancel">Annuler</v-btn>
        <v-btn color="primary" variant="text" @click="handleCreate">Créer</v-btn>
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

// Gestion de la visibilité interne
const internalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const sessionName = ref('')
const selectedClass = ref(0) // Index de la classe sélectionnée
const selectedCompetenceIds = ref<number[]>([])

// Sélectionner toutes les compétences par défaut
watch(() => props.competences, (newCompetences) => {
  if (newCompetences) {
    selectedCompetenceIds.value = newCompetences.map(c => c.id)
  }
}, { immediate: true })

function cancel() {
  internalVisible.value = false
}

function handleCreate() {
  if (!sessionName.value || selectedClass.value === undefined) {
    alert("Veuillez remplir tous les champs")
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
