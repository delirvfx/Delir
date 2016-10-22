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
        const permitConfigKeys = _.keys(composition.config)
        Object.assign(composition.config, _.pick(compJson, permitConfigKeys))

        const timelanes = compJson.timelanes.map(lane => TimeLane.deserialize(lane))
        composition.timelanes = new ProxySet(timelanes, Composition._timelanesProxySetHandler(composition))

        return composition
    }

    _id: string
    _project: ?Project

    timelanes : ProxySet<TimeLane> = new ProxySet([], Composition._timelanesProxySetHandler(this))

    config : {
        width: ?number,
        height: ?number,
        framerate: ?number,
        // duration: number,
    } = {
        width: null,
        height: null,
        framerate: null,
    }

    get id(): string { return this._id }


    toJSON()
    {
        return {
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toJSON())
        }
    }
}
