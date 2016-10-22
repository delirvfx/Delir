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

    static deserialize(compJson: Object)
    {
        const composition = new Composition
        composition._id = compJson._id

        const permitConfigKeys = _.keys(composition._config)
        Object.assign(composition._config, _.pick(compJson.config, permitConfigKeys))

        const timelanes = compJson.timelanes.map(lane => TimeLane.deserialize(lane))
        composition.timelanes = new ProxySet(timelanes, Composition._timelanesProxySetHandler(composition))

        return composition
    }

    _id: string
    _project: ?Project

    timelanes : ProxySet<TimeLane> = new ProxySet([], Composition._timelanesProxySetHandler(this))

    _config : {
        name: ?string,
        width: ?number,
        height: ?number,
        framerate: ?number,
        // duration: number,
    } = {
        name: null,
        width: null,
        height: null,
        framerate: null,
    }

    get id(): string { return this._id }

    get name(): string { return this._config.name }
    set name(name: string) { this._config.name = name }

    get width(): number { return this._config.width }
    set width(width: number) { this._config.width = width }

    get height(): number { return this._config.height }
    set height(height: number) { this._config.height = height }

    get framerate(): number { return this._config.framerate }
    set framerate(framerate: number) { this._config.framerate = framerate }

    toPreBSON(): Object
    {
        return {
            _id: this.id,
            config: Object.assign(this._config),
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            _id: this.id,
            config: Object.assign(this._config),
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toPreBSON()),
        }
    }
}
