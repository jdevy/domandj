<template>
    <v-dialog v-model="internalVisible" max-width="700px" persistent>
        <v-card>
            <v-card-title class="text-h6 bg-primary text-white">
                Gestion des compétences
            </v-card-title>

            <v-card-text class="bg-grey-lighten-4">
                <!-- Liste des compétences existantes -->
                <v-expansion-panels>
                    <v-expansion-panel v-for="(comp, index) in store.state.competences" :key="comp.id">
                        <v-expansion-panel-title hide-actions>
                            <span class="competence-title">{{ comp.libelle_long }}</span>
                            <v-spacer />
                            <v-btn icon="mdi-delete" color="error" size="small" @click.stop="deleteCompetence(index)" />
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-text-field v-model="comp.libelle_long" label="Nom complet" variant="outlined"
                                hide-details class="mb-2" @blur="saveCompetence(index)" />

                            <v-text-field v-model="comp.libelle_court" label="Nom court" variant="outlined" hide-details
                                class="mb-2" />

                            <v-text-field v-model.number="comp.coeff" label="Coefficient" type="number"
                                variant="outlined" hide-details />
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>

                <v-divider class="my-4" />

                <!-- Ajouter une nouvelle compétence -->
                <v-list-item class="new-competence-item">
                    <v-text-field v-model="newCompetence.libelle_long" placeholder="Nom complet de la compétence"
                        variant="outlined" hide-details class="competence-field" @keyup.enter="addCompetenceFromField">
                    </v-text-field>

                    <v-text-field v-model="newCompetence.libelle_court" placeholder="Nom court" variant="outlined"
                        hide-details class="competence-field mt-2" @keyup.enter="addCompetenceFromField" />

                    <v-text-field v-model.number="newCompetence.coeff" placeholder="Coefficient" type="number"
                        variant="outlined" hide-details class="competence-field mt-2"
                        @keyup.enter="addCompetenceFromField">
                        <template #append>
                            <div class="competence-action" @click="addCompetenceFromField">
                                <v-icon size="34" color="green-darken-2" class="add-icon">mdi-plus</v-icon>
                            </div>
                        </template>
                    </v-text-field>
                </v-list-item>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn text @click="internalVisible = false">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useEvaluationStore } from '@/stores/evaluationStore'
import type { Competence } from '@/models'

const props = defineProps({
    visible: Boolean
})

const emit = defineEmits(['update:visible'])

const store = useEvaluationStore()

// Gestion de la visibilité interne
const internalVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

// Nouvelle compétence en cours de création
const newCompetence = ref<Omit<Competence, 'id'>>({
    libelle_long: '',
    libelle_court: '',
    coeff: 1,
    statut: null
})

// Fonction pour ajouter une compétence depuis les champs
function addCompetenceFromField() {
    if (!newCompetence.value.libelle_long.trim() || !newCompetence.value.libelle_court.trim()) {
        return
    }

    // Générer un nouvel ID
    const newId = store.state.competences.length > 0
        ? Math.max(...store.state.competences.map(c => c.id)) + 1
        : 1

    // Ajouter la nouvelle compétence
    store.state.competences.push({
        id: newId,
        ...newCompetence.value
    })

    // Réinitialiser les champs
    newCompetence.value = {
        libelle_long: '',
        libelle_court: '',
        coeff: 1,
        statut: null
    }
}

// Fonction pour supprimer une compétence
function deleteCompetence(index: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette compétence ?')) return

    const competenceId = store.state.competences[index].id

    // Vérifier que la compétence n'est pas utilisée dans des sessions
    const isUsed = store.state.sessions.some(session =>
        session.selectedCompetenceIds.includes(competenceId)
    )

    if (isUsed) {
        alert("Cette compétence est utilisée dans une ou plusieurs sessions et ne peut pas être supprimée.")
        return
    }

    store.state.competences.splice(index, 1)
}

// Fonction pour sauvegarder une compétence modifiée
function saveCompetence(index: number) {
    // La sauvegarde est automatique grâce à la réactivité du store
    // Pas besoin de faire quoi que ce soit de plus
}
</script>

<style scoped>
.competence-field {
    margin-top: 6px;
}

.competence-field .v-field__append-inner {
    display: flex;
    align-items: center;
}

.competence-action {
    margin: 0;
    padding: 0;
    min-width: 40px;
}

.new-competence-item {
    margin-top: 20px;
}

.competence-title {
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
