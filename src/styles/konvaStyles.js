// src/styles/konvaStyles.js

export const evaluationButtonRect = {
    width: 44,
    height: 44,
    fill: '#ff7043',
    stroke: '#dfefff',
    strokeWidth: 2,
    cornerRadius: 12,
    shadowBlur: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { x: 1, y: 1 },
    listening: true,
    cursor: 'pointer'
}

export const evaluationButtonText = {
    text: '?',
    fontSize: 25,
    fontStyle: 'bold',
    fill: '#dfefff',
    align: 'center',
    verticalAlign: 'middle',
    width: 44,
    height: 44,
    offsetX: 0,
    offsetY: -2,
    listening: false
}

export const defaultGroupPosition = (x = 100, y = 100) => ({
    x,
    y,
    listening: true,
})
