import { DeshapeContext } from '../DeshapeContext'
import { SVGObject } from '../Objects/SVGObject'
import { ICommand } from './ICommand'

export class AddObjectCommand implements ICommand {
    private index: number

    constructor(private object: SVGObject<any>) {}

    public present(ctx: DeshapeContext) {
        ctx.objects.push(this.object)
    }

    public doUndo(ctx: DeshapeContext) {
        const index = ctx.objects.findIndex(obj => obj.id === this.object.id)
        if (index === -1) return

        this.index = index
        ctx.objects.splice(index, 1)
    }

    public doRedo(ctx: DeshapeContext) {
        ctx.objects.splice(this.index, 0, this.object)
    }
}
