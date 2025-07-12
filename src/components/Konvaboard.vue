<template>
    <div class="stage-wrapper">
        <v-stage :config="stageSize">
            <v-layer>
                <!-- Plots -->
                <v-group v-for="plot in plots" :key="plot.id"
                    :config="{ x: plot.x, y: plot.y, draggable: true, dragBoundFunc: pos => limitPlotToBounds(pos) }"
                    @dragmove="updatePlotPosition(plot, $event)">
                    <v-rect :config="{
                        width: 130, height: 130, fill: highlightedPlotId === plot.id ? '#8ef0aa' : '#ccc', stroke: '#000', shadowColor: highlightedPlotId === plot.id ? '#666' : '',
                        shadowBlur: highlightedPlotId === plot.id ? 8 : 0
                    }" />
                    <v-text :config="{ text: plot.name, fontSize: 14, x: 85, y: 5 }" />
                </v-group>

                <!-- Élèves  -->
                <v-group v-for="(student, index) in students" :key="student.id"
                    :config="{ ...getStudentPosition(student, index), draggable: true, dragBoundFunc: pos => limitStudentToBounds(pos) }"
                    @dragmove="highlightPlotUnder(student, $event)" @dragend="updateStudentPosition(student, $event)">
                    <v-image v-if="avatarImage"
                        :config="{ image: avatarImage, width: 40, height: 40, offset: { x: 30, y: 20 } }" />
                    <!-- Étiquette prénom -->
                    <v-group>
                        <v-rect :config="{
                            x: 12, y: -10,
                            width: 70, height: 25,
                            fill: '#186efa', cornerRadius: 10
                        }" />
                        <v-text :config="{
                            text: student.name,
                            x: 25, y: -4,
                            fontSize: 14, fill: '#fff', width: 50, align: 'left'
                        }" />
                    </v-group>
                </v-group>
            </v-layer>
        </v-stage>
    </div>
</template>

<script>
export default {
    props: ['plots', 'students', 'avatarImage', 'stageSize'],
    emits: ['update:plots', 'update:students'],
    data() {
        return {
            highlightedPlotId: null,
        }
    },
    methods: {
        getStudentPosition(student, index) {
            if (student.plotId) {
                const plot = this.plots.find(p => p.id === student.plotId)
                const i = this.students.filter(s => s.plotId === student.plotId).indexOf(student)
                return {
                    x: plot.x + 10,
                    y: plot.y + 40 + i * 40,
                }
            } else {
                const margin = 20
                const baseX = Math.max(this.stageSize.width - 130 - margin, margin)

                return {
                    x: baseX,
                    y: 60 + index * 60,
                }
            }
        },
        updatePlotPosition(plot, event) {
            const pos = event.target.position()
            plot.x = pos.x
            plot.y = pos.y
        },
        updateStudentPosition(student, event) {
            const group = event.target;
            const pos = group.getAbsolutePosition();
            if (!pos) return;
            const width = 40;
            const height = 40;

            try {
                const group = event.target;
                const pos = group.getAbsolutePosition();
                const width = 40;
                const height = 40;

                const centerX = pos.x + width / 2;
                const centerY = pos.y + height / 2;

                const plot = this.plots.find(p =>
                    centerX >= p.x &&
                    centerX <= p.x + 130 &&
                    centerY >= p.y &&
                    centerY <= p.y + 130
                );

                if (plot) {
                    student.plotId = plot.id;
                } else {
                    student.plotId = null;
                    student.x = pos.x;
                    student.y = pos.y;
                }

                this.highlightedPlotId = null;
            } catch (e) {
                console.error("Drag end error:", e);
            }
        },
        limitPlotToBounds(pos) {
            const plotWidth = 130
            const plotHeight = 130

            const maxX = this.stageSize.width - plotWidth
            const maxY = this.stageSize.height - plotHeight

            const x = Math.max(0, Math.min(pos.x, maxX))
            const y = Math.max(0, Math.min(pos.y, maxY))

            return { x, y }
        },
        limitStudentToBounds(pos) {
            const studentWidth = 70
            const studentHeight = 40

            const padding = 30

            const maxX = this.stageSize.width - studentWidth - padding
            const maxY = this.stageSize.height - studentHeight - padding

            const x = Math.max(padding, Math.min(pos.x, maxX))
            const y = Math.max(padding, Math.min(pos.y, maxY))

            return { x, y }
        },
        highlightPlotUnder(student, event) {
            const group = event.target;
            const pos = group.getAbsolutePosition();
            const width = 40;  // largeur approximative de l’élève (ou calcule dynamiquement si besoin)
            const height = 40; // idem

            const centerX = pos.x + width / 2;
            const centerY = pos.y + height / 2;

            const plot = this.plots.find(p =>
                centerX >= p.x &&
                centerX <= p.x + 130 &&
                centerY >= p.y &&
                centerY <= p.y + 130
            );

            this.highlightedPlotId = plot ? plot.id : null;
        },
    },
}
</script>
<style scoped>
.stage-wrapper {
    width: 100%;
    max-width: 1024px;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    border: 1px solid #ccc;
    background-color: #964040;
    overflow: hidden;
    position: relative;
}
</style>