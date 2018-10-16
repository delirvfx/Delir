import { SVGNS } from '../Tools'
import { SVGObject } from './SVGObject'

interface PathObjectProps {
    points: [number, number][]
}

export class PathObject extends SVGObject<PathObjectProps> {
    public toSvgElement() {
        const el = document.createElementNS(SVGNS, 'path')
        this.attachBaseAttributes(el)

        const clone = [...this.props.points]
        const first = clone.shift()!
        const d = [`M${first[0]},${first[1]}`]
        clone.forEach(p => d.push(`L${p[0]},${p[1]}`))

        el.setAttribute('d', d.join(''))

        return el
    }
}
