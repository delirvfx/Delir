import uuid = require('uuid')

export interface SVGObjectProps {
    fill: string
    fillOpacity: number
    stroke: string
    strokeOpacity: number
    strokeWidth: number
    strokeLineCap: string
    strokeDashArray: number[]
}

export abstract class SVGObject<T extends object> {
    public id: string
    public props: T & Partial<SVGObjectProps> = Object.create(null)

    constructor(props: T & Partial<SVGObjectProps>) {
        this.id = uuid.v4()
        Object.assign(this.props, props)
    }

    public abstract toSvgElement(): SVGElement

    protected attachBaseAttributes(el: SVGElement) {
        el.dataset.id = this.id
        this.props.fill && el.setAttribute('fill', this.props.fill)
        this.props.fillOpacity && el.setAttribute('fillOpacity', this.props.fillOpacity.toString())
        this.props.stroke && el.setAttribute('stroke', this.props.stroke)
        this.props.strokeOpacity && el.setAttribute('strokeOpacity', this.props.strokeOpacity.toString())
        this.props.strokeWidth && el.setAttribute('strokeWidth', this.props.strokeWidth.toString())
        this.props.strokeLineCap && el.setAttribute('strokeLinecap', this.props.strokeLineCap)
        this.props.strokeDashArray && el.setAttribute('strokeLinecap', this.props.strokeDashArray.join(','))
    }
}
