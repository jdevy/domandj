import { reactive, watch } from 'vue'
import type { Student } from '@/models'
import defaultData from '@/data/classes.json'
import debounce from 'lodash.debounce'

const STORAGE_KEY = 'tp-classes'

function loadClasses(): Record<string, Omit<Student, 'x' | 'y' | 'plotId'>[]> {
  console.log('loadClasses')
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    return JSON.parse(saved)
  }
// Première initialisation depuis le JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return defaultData
}

export const classesStore = reactive<Record<string, Omit<Student, 'x' | 'y' | 'plotId'>[]>>(loadClasses())

export function saveClasses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classesStore))
}

watch(
  classesStore,
  debounce(() => {
    saveClasses()
  }, 500),
  { deep: true }
)
