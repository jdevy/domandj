<template>
    <div v-if="visible && form" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
            <button class="modal-close" @click="emit('close')">✕</button>

            <h2>{{plotStudents.map(s => s.name).join(' / ')}}</h2>
            <CompetenceToggle v-for="entry in form.competences" :key="entry.id"
                :label="competenceList.find(c => c.id === entry.id)?.libelle_long || 'Compétence inconnue'"
                v-model="entry.statut" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import debounce from 'lodash.debounce'
import CompetenceToggle from './CompetenceToggle.vue'
import { EvaluationForm } from '@/models';

const props = defineProps<{
    visible: boolean
    form: {
        plotId: number
        plotName: string
        competences: { id: number; statut: boolean | null }[]
    } | null
    competenceList: { id: number; libelle_long: string; libelle_court: string; coeff: number }[]
    students: any[]
}>()

const emit = defineEmits(['close'])

const plotStudents = computed(() => {
    return props.students.filter(s => s.plotId === props.form?.plotId)
})

watch(() => props.form, debounce((newForm: EvaluationForm) => {
    if (newForm) {
        localStorage.setItem(`evaluation-${newForm.plotId}`, JSON.stringify(newForm))
    }
}, 300), { deep: true })

</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    /* fond sombre */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
}

.modal-close {
    position: absolute;
    top: 8px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
}

.competence {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.buttons button {
    margin-left: 8px;
    padding: 4px 10px;
    font-size: 1.1rem;
    border-radius: 5px;
    border: none;
    cursor: pointer;
}

.buttons button.selected {
    font-weight: bold;
    background-color: #d4f4dd;
    /* ✅ vert clair */
}

.buttons button:nth-child(2).selected {
    background-color: #f9caca;
    /* ❌ rouge clair */
}

.modal-title {
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 1rem;
}
</style>