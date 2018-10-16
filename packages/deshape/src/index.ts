import { ICommand } from './Commands/ICommand'
import { DeshapeContext } from './DeshapeContext'
import { InputContext } from './InputContext'
import { Tools } from './Tools'

interface DeshapeOption {
    width: number
    height: number
}

export default class Deshape {
    public root: HTMLDivElement
    public canvasSvg: SVGSVGElement
    public tools: Tools
    public currentInputContext: InputContext<any> | null

    private context: DeshapeContext

    constructor(options: DeshapeOption) {
        this.tools = new Tools()

        this.root = document.createElement('div')
        this.root.style.width = `${options.width}px`
        this.root.style.height = `${options.height}px`

        this.canvasSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.canvasSvg.setAttribute('width', `${options.width}`)
        this.canvasSvg.setAttribute('height', `${options.height}`)
        this.canvasSvg.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`)

        this.canvasSvg.addEventListener('mouseup', this.handleMouseUp)
        this.canvasSvg.addEventListener('mousemove', this.handleMouseMove)
        this.canvasSvg.addEventListener('mousedown', this.handleMouseDown)

        this.context = new DeshapeContext(this.canvasSvg)
        this.root.appendChild(this.canvasSvg)
    }

    public undo() {
        this.context.undo()
    }

    public redo() {
        this.context.redo()
    }

    public serializeProject(): any {

    }

    private handleMouseDown = (e: MouseEvent) => {
        this.currentInputContext = new InputContext(this.canvasSvg)
        this.tools.activeTool.onMouseDown(e, this.currentInputContext!, this.context)
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.currentInputContext) this.currentInputContext = new InputContext(this.canvasSvg)
        this.tools.activeTool.onMouseMove(e, this.currentInputContext!, this.context)
    }

    private handleMouseUp = (e: MouseEvent) => {
        if (!this.currentInputContext) return
        this.tools.activeTool.onMouseUp(e, this.currentInputContext, this.context)
        this.currentInputContext = null
    }
}
