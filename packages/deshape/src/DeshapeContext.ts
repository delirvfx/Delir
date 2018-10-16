import { ICommand } from 'Commands/ICommand'
import { SVGObject } from 'Objects/SVGObject'
import { Timeline } from './Timeline'

export class DeshapeContext {
    public objects: SVGObject<any>[] = []
    public timeline: Timeline = new Timeline()
    public selectionIds: Set<string> = new Set()

    private undoStack: ICommand[] = []
    private redoStack: ICommand[] = []

    constructor(private canvasSvg: SVGSVGElement) {}

    public commit(command: ICommand) {
        command.present(this)
        this.undoStack.push(command)
        this.redoStack = []
        this.render()
    }

    public undo() {
        const command = this.undoStack.pop()
        if (!command) return

        command.doUndo(this)
        this.redoStack.push(command)
        this.render()
    }

    public redo() {
        const command = this.redoStack.pop()
        if (!command) return

        command.doRedo(this)
        this.undoStack.push(command)
        this.render()
    }

    private render() {
        [...this.canvasSvg.children].forEach((el) => {
            this.canvasSvg.removeChild(el)
        })

        this.objects.forEach(obj => {
            this.canvasSvg.appendChild(obj.toSvgElement())
        })
    }
}
