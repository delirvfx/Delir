import { SVGNS } from '../Tools'
import { SVGObject } from './SVGObject'

interface RectObjectProps {
    x: number
    y: number
    width: number
    height: number
}

export class RectObject extends SVGObject<RectObjectProps> {
    public toSvgElement() {
        const rect = document.createElementNS(SVGNS, 'rect')
        this.attachBaseAttributes(rect)

        rect.setAttribute('x', this.props.x.toString())
        rect.setAttribute('y', this.props.y.toString())
        rect.setAttribute('width', this.props.width.toString())
        rect.setAttribute('height', this.props.height.toString())

        return rect
    }
}
