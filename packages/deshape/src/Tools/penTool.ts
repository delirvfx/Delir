import { AddObjectCommand } from '../Commands/AddObjectCommand'
import { InputContext } from '../InputContext'
import { PathObject } from '../Objects/PathObject'
import { SVGNS, Tool } from '../Tools'

interface PenContext {
    el: SVGPathElement
    paths: { x: number, y: number }[]
}

const buildPath = (paths: any[]) => {
    const clone = [...paths]
    const first = clone.shift()
    const d = [`M${first.x},${first.y}`]
    clone.forEach(p => d.push(`L${p.x},${p.y}`))
    return d.join('')
}

export const penTool: Tool = {
    onMouseDown(e, inCtx: InputContext<PenContext>) {
        const el = document.createElementNS(SVGNS, 'path')
        el.setAttribute('strokeWidth', '2')
        el.setAttribute('stroke', '#f00')
        el.setAttribute('fill', 'none')
        inCtx.root.appendChild(el)

        inCtx.store = {
            el,
            paths: [ { x: e.offsetX, y: e.offsetY } ]
        }
    },
    onMouseMove(e, inCtx: InputContext<PenContext>) {
        const {el, paths} = inCtx.store

        const path = inCtx.store.paths = [
            ...paths,
            {x: e.offsetX, y: e.offsetY},
        ]

        el.setAttribute('d', buildPath(path))
    },
    onMouseUp(e, inCtx: InputContext<PenContext>, ctx) {
        const { el, paths } = inCtx.store
        el.remove()

        ctx.commit(
            new AddObjectCommand(
                new PathObject({ points: paths.map(({x, y}): [number, number] => [x, y]) })
            )
        )
    }
}
