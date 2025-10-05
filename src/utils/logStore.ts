// src/utils/logStore.ts
import { Competence, Student, Session, Plot } from '@/models';
import { useEvaluationStore } from '@/stores/evaluationStore'

export function logStoreState(detailed: boolean = false) {
    const store = useEvaluationStore()

    // Créer une copie propre de l'état
    const stateCopy = JSON.parse(JSON.stringify(store.state))

    if (detailed) {
        console.log('%c=== ÉTAT COMPLET DU STORE ===', 'color: #4CAF50; font-weight: bold; font-size: 14px')
        console.log({
            classes: stateCopy.classes,
            competences: stateCopy.competences,
            sessions: stateCopy.sessions,
            currentSessionId: stateCopy.currentSessionId
        })
    } else {
        // Version simplifiée
        console.log('%c=== ÉTAT SIMPLIFIÉ DU STORE ===', 'color: #2196F3; font-weight: bold; font-size: 14px')

        // Résumé des classes
        const parsedCopy = stateCopy.classes as Record<string, Student[]>
        console.log('📚 Classes (%d):', Object.keys(stateCopy.classes).length)
        Object.entries(parsedCopy).forEach(([className, students]: [string, Student[]]) => {
          console.log(`  - ${className}: ${students.length} élèves`)
        })

        // Résumé des compétences
        console.log('⭐ Compétences (%d):', stateCopy.competences.length)
        stateCopy.competences.forEach((comp: Competence) => {
            console.log(`  - ${comp.libelle_court} (${comp.id}): ${comp.libelle_long}`)
        })
        // Résumé des sessions
        console.log('📝 Sessions (%d):', stateCopy.sessions.length)
        stateCopy.sessions.forEach((session: Session) => {
            console.log(`  - ${session.name} (${session.className}): ${session.plotGroups.length} plots`)
        })

        // Session courante
        console.log('🔍 Session courante:',
            stateCopy.currentSessionId ?
                stateCopy.sessions.find((s: Session) => s.id === stateCopy.currentSessionId)?.name :
                'Aucune'
        )
    }

    // Afficher aussi la session courante complète si elle existe
    if (stateCopy.currentSessionId) {
        const currentSession = stateCopy.sessions.find((s: Session) => s.id === stateCopy.currentSessionId)
        if (currentSession) {
            console.log('%c--- DÉTAILS SESSION COURANTE ---', 'color: #FF9800; font-weight: bold')
            console.log('Nom:', currentSession.name)
            console.log('Classe:', currentSession.className)
            console.log('Date:', currentSession.date)
            console.log('Compétences sélectionnées:', currentSession.selectedCompetenceIds)
            console.log('Nombre de plots:', currentSession.plotGroups.length)
            currentSession.plotGroups.forEach((plot: Plot, i: number) => {
                console.log(`  Plot ${i + 1}: ${plot.name} (${plot.students.length} élèves)`)
                if (plot.evaluations && Object.keys(plot.evaluations).length > 0) {
                    console.log(`    Évaluations: ${Object.keys(plot.evaluations).length} compétence(s) évaluée(s)`)
                }
            })
        }
    }
}
