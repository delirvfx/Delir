import { InputContext } from './InputContext'
import { rectTool } from './Tools/rectTool'

export interface Tool {
    onMouseUp(e: MouseEvent, context: InputContext<any>): void
    onMouseMove(e: MouseEvent, context: InputContext<any>): void
    onMouseDown(e: MouseEvent, context: InputContext<any>): void
}

export const SVGNS = 'http://www.w3.org/2000/svg'

export class Tools {
    public activeTool: Tool = rectTool

    public select() {}

    public rect() {
        this.activeTool = rectTool
    }
}
