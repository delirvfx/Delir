import { DeshapeContext } from '../DeshapeContext'
import { InputContext } from '../InputContext'
import { Tool } from '../Tools'

interface SelectContext {
    begin: { x: number, y: number }
}

export const selectTool: Tool = {
    onMouseDown({target, shiftKey, offsetX, offsetY}, inCtx: InputContext<SelectContext>, ctx) {
        if (!shiftKey) {
            ctx.selectionIds = new Set()
        }

        if (!(target as SVGElement).matches('[data-id]')) return
        ctx.selectionIds.add((target as SVGElement).dataset.id!)

        // inCtx.store.begin = { x: offsetX, y: offsetY }
        // inCtx.store.positions = [...ctx.selectionIds].map(id => {
        //     const obj = ctx.objects.find(obj => obj.id === id)
        //     if (!obj) return
        //     obj.props
        // })
    },
    onMouseMove(e, inCtx: InputContext<SelectContext>, ctx) {
        if (!inCtx.store.begin) return
        // ctx.
    },
    onMouseUp(e, inCtx) {

    },
}
