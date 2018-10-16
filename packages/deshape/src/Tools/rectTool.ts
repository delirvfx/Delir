import { AddObjectCommand } from '../Commands/AddObjectCommand'
import { InputContext } from '../InputContext'
import { RectObject } from '../Objects/RectObject'
import { SVGNS, Tool } from '../Tools'

interface RectContext {
    el: SVGRectElement
    begin: { x: number, y: number}
    rect: { x: number, y: number, width: number, height: number }
}

export const rectTool: Tool = {
    onMouseDown(e, inCtx: InputContext<RectContext>) {
        const rect = inCtx.store.el = document.createElementNS(SVGNS, 'rect')
        rect.setAttribute('x', `${e.offsetX}`)
        rect.setAttribute('y', `${e.offsetY}`)
        rect.setAttribute('width', '0')
        rect.setAttribute('height', '0')
        rect.setAttribute('fill', '#ff0000')
        inCtx.root.appendChild(rect)

        inCtx.store.begin = {
            x: e.offsetX,
            y: e.offsetY
        }
    },
    onMouseMove(e, inCtx: InputContext<RectContext>) {
        if (!inCtx.store.begin) return

        const { el, begin } = inCtx.store

        const width = e.offsetX - inCtx.store.begin.x
        const height = e.offsetY - inCtx.store.begin.y
        const x = width < 0 ? begin.x + width : begin.x
        const y = height < 0 ? begin.y + height : begin.y

        el.setAttribute('x', `${x}`)
        el.setAttribute('y', `${y}`)
        el.setAttribute('width', Math.abs(width).toString())
        el.setAttribute('height', Math.abs(height).toString())

        inCtx.store.rect = {
            x,
            y,
            width: Math.abs(width),
            height: Math.abs(height),
        }
    },
    onMouseUp(e, inCtx: InputContext<RectContext>, ctx) {
        if (!inCtx.store.rect) return

        const { el, rect } = inCtx.store
        el.remove()

        ctx.commit(new AddObjectCommand(new RectObject({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        })))
    },
}
