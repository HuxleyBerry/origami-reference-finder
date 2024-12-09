type Angle = number
export type Arrow = [number, number, number, number]
export type Line = [number, number, number, number]
export type LineSection = [number, number, Angle]
export type Point = [number, number]

export interface DrawingSettings {
    pointColour: string
    mainColour: string
    lineSectionLength: number
}

export interface Sequence {
    sequence: number[]
    difference: number
    landmark: number
}

export interface FoldDrawingElements {
    line: Line
    arrows: Arrow[]
    description: string
    points: (Point | LineSection)[]
}