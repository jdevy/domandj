import { Plot, Student } from '@/models'

export function getStudentsForPlot(plot: Plot, allStudents: Student[]): Student[] {
  return allStudents.filter(s => s.plotId === plot.id)
}

export function hasStudents(plot: Plot, allStudents: Student[]): boolean {
  return getStudentsForPlot(plot, allStudents).length > 0
}