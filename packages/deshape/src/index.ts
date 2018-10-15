import { InputContext } from './InputContext'
import { Tools } from './Tools'

interface DeshapeOption {
    width: number
    height: number
}

export default class Deshape {
    public root: SVGSVGElement
    public tools: Tools
    public currentInputContext: InputContext<any> | null

    constructor(options: DeshapeOption) {
        this.root = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.root.setAttribute('width', `${options.width}`)
        this.root.setAttribute('height', `${options.height}`)
        this.root.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`)

        const rect: SVGRectElement = this.root.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
        rect.setAttribute('x', '10')
        rect.setAttribute('y', '10')
        rect.setAttribute('width', '100')
        rect.setAttribute('height', '100')
        rect.setAttribute('fill', '#f00')

        this.tools = new Tools()

        this.root.addEventListener('mouseup', this.handleMouseUp)
        this.root.addEventListener('mousemove', this.handleMouseMove)
        this.root.addEventListener('mousedown', this.handleMouseDown)
    }

    private handleMouseDown = (e: MouseEvent) => {
        this.currentInputContext = new InputContext(this.root)
        this.tools.activeTool.onMouseDown(e, this.currentInputContext!)
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.currentInputContext) return
        this.tools.activeTool.onMouseMove(e, this.currentInputContext)
    }

    private handleMouseUp = (e: MouseEvent) => {
        if (!this.currentInputContext) return
        this.tools.activeTool.onMouseUp(e, this.currentInputContext)
        this.currentInputContext = null
    }
}
