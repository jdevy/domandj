import type Konva from 'konva'


export type DragKonvaEvent = Konva.KonvaEventObject<DragEvent>
export type KonvaEvt<T extends Event = Event> = Konva.KonvaEventObject<T>
export type Position = { x: number; y: number }