import type { RectConfig, TextConfig, GroupConfig, ImageConfig } from 'konva/lib/Shape'
import type { Plot } from '@/models'

export const evaluationButtonRect: RectConfig = {
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

export const evaluationButtonText: TextConfig = {
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

// Position du bouton
export function defaultGroupPosition(x: number, y: number): GroupConfig {
  return {
    x,
    y,
    listening: true,
    cursor: 'pointer',
  }
}

// Styles des plots
export function getPlotRectStyle(plot: Plot, isHighlighted: boolean, isBeingDeleted: boolean): RectConfig {
  return {
    width: 130,
    height: 130,
    fill: isBeingDeleted
      ? '#e53935'
      : isHighlighted
      ? '#8ef0aa'
      : '#dfefff',
    stroke: '#792f60',
    shadowColor: isHighlighted ? '#666' : '',
    shadowBlur: isHighlighted ? 8 : 0,
  }
}

export function getPlotTextStyle(plot: Plot): TextConfig {
  return {
    fontSize: 14,
    x: 85,
    y: 5,
  }
}

// Styles des élèves
export function getStudentAvatarStyle(image: HTMLImageElement): ImageConfig {
  return {
    image,
    width: 40,
    height: 40,
    offset: { x: 30, y: 20 },
  }
}

export function getStudentLabelRectStyle(): RectConfig {
  return {
    x: 12,
    y: -10,
    width: 70,
    height: 25,
    fill: '#186efa',
    cornerRadius: 10,
  }
}

export function getStudentLabelTextStyle(name: string): TextConfig {
  return {
    text: name,
    x: 25,
    y: -4,
    fontSize: 14,
    fill: '#fff',
    width: 50,
    align: 'left',
  }
}