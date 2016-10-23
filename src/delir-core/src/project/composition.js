// @flow
import _ from 'lodash'
import ProxySet from './_proxy-set'

import Project from './project'
import TimeLane from './timelane'
import Layer from './layer'

export default class Composition
{
    static _timelanesProxySetHandler = composition => ({
        add: (add, timelanes, [value: TimeLane]) => {
            if (composition._project == null) {
                throw new Error('TimeLane must be added to Composition after add Project')
            }

            if (! (value instanceof TimeLane)) {
                throw new TypeError('composition.timelanes only add to TimeLane object')
            }

            value._id = composition._project._generateAndReserveSymbolId()
            value._comp = composition

            return add.call(timelanes, value)
        }
    })

    static deserialize(compJson: Object, project: Project)
    {
        const comp = new Composition
        const config = _.pick(compJson.config, [
            'name',
            'width',
            'height',
            'framerate',
            'durationFrame',
        ])

        const timelanes = compJson.timelanes.map(lane => TimeLane.deserialize(lane))

        comp._id = compJson.id
        comp._project = project
        comp.timelanes = new ProxySet(timelanes, Composition._timelanesProxySetHandler(comp))
        Object.assign(comp.config, config)
        return comp
    }

    _id: string
    _project: ?Project

    timelanes : ProxySet<TimeLane> = new ProxySet([], Composition._timelanesProxySetHandler(this))

    config : {
        name: ?string,
        width: ?number,
        height: ?number,
        framerate: ?number,
        durationFrame: ?number,
    } = {
        name: null,
        width: null,
        height: null,
        framerate: null,
        durationFrame: null,
    }

    get id(): string { return this._id }

    get name(): string { return this.config.name }
    set name(name: string) { this.config.name = name }

    get width(): number { return this.config.width }
    set width(width: number) { this.config.width = width }

    get height(): number { return this.config.height }
    set height(height: number) { this.config.height = height }

    get framerate(): number { return this.config.framerate }
    set framerate(framerate: number) { this.config.framerate = framerate }

    toPreBSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign(this.config),
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign(this.config),
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toPreBSON()),
        }
    }
}
