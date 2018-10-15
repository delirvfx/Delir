import { InputContext } from '../InputContext'
import { SVGNS, Tool } from '../Tools'

interface RectContext {
    el: SVGRectElement
    begin: { x: number, y: number}
}

export const rectTool: Tool = {
    onMouseDown(e, inCtx: InputContext<RectContext>) {
        const rect = inCtx.store.el = document.createElementNS(SVGNS, 'rect')
        rect.setAttribute('x', `${e.clientX}`)
        rect.setAttribute('y', `${e.clientY}`)
        rect.setAttribute('width', '0')
        rect.setAttribute('height', '0')
        rect.setAttribute('fill', '#ff0000')
        inCtx.root.appendChild(rect)

        inCtx.store.begin = {
            x: e.clientX,
            y: e.clientY
        }
        // tslint:disable-next-line
        console.log('down')
    },
    onMouseMove(e, inCtx: InputContext<RectContext>) {
        const { el, begin } = inCtx.store

        const sizeX = e.clientX - inCtx.store.begin.x
        const sizeY = e.clientY - inCtx.store.begin.y

        sizeX < 0 && el.setAttribute('x', `${begin.x - sizeX}`)
        sizeY < 0 && el.setAttribute('y', `${begin.y - sizeX}`)
        el.setAttribute('width', Math.abs(sizeX).toString())
        el.setAttribute('height', Math.abs(sizeX).toString())
        // tslint:disable-next-line
        console.log('move')
    },
    onMouseUp(e) {
        // tslint:disable-next-line
        console.log('up')
    },
}
