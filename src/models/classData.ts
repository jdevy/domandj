import type { Student } from './student'

// Si tu utilises un fichier JSON
import data from '../data/classes.json'

const classData = data as Record<string, Omit<Student, 'x' | 'y' | 'plotId'>[]>

export default classData