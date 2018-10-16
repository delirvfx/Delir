import { DeshapeContext } from 'DeshapeContext'
import { InputContext } from './InputContext'
import { penTool } from './Tools/penTool'
import { rectTool } from './Tools/rectTool'
import { selectTool } from './Tools/selectTool'

export interface Tool {
    onMouseUp(e: MouseEvent, context: InputContext<any>, ctx: DeshapeContext): void
    onMouseMove(e: MouseEvent, context: InputContext<any>, ctx: DeshapeContext): void
    onMouseDown(e: MouseEvent, context: InputContext<any>, ctx: DeshapeContext): void
}

export const SVGNS = 'http://www.w3.org/2000/svg'

export class Tools {
    public activeTool: Tool = penTool

    public select() {
        this.activeTool = selectTool
    }

    public rect() {
        this.activeTool = rectTool
    }

    public pen() {
        this.activeTool = penTool
    }
}
