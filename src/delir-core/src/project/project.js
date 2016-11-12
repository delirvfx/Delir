// @flow
import _ from 'lodash'
import uuid from 'uuid'
import {BSONPure} from 'bson'

import ProxySet from './_proxy-set'
import Asset from './asset'
import Composition from './composition'

export default class Project
{
    static deserialize(projectBson: Buffer)
    {
        const projectJson = (new BSONPure.BSON()).deserialize(projectBson)

        const project = new Project()
        const symbolIds = projectJson.symbolIds
        const assets = projectJson.assets.map(assetJson => Asset.deserialize(assetJson))
        const compositions = projectJson.compositions.map(compJson => Composition.deserialize(compJson, project))

        project.symbolIds = new Set(symbolIds)
        project.assets = new Set(assets)
        project.compositions = new Set(compositions)

        return project
    }

    symbolIds: Array<string> // Set<string> = new Set()

    assets: Set<Asset> = new Set

    compositions: Set<Composition> = new Set

    // _commandHistory: []

    // static deserialize(deserializedBson: Object)
    // {
    //
    // }
    //
    // static deserialize(): Document {
    //     const bson = new BSONPure.BSON()
    //     return new Document()
    // }
    /**
     * @deprecated
     */
    _generateAndReserveSymbolId(): string
    {
        let id

        do {
            id = uuid.v4()
        } while (this._symbolIds.has(id))

        this._symbolIds.add(id)
        return id
    }

    toPreBSON()
    {
        return {
            formatVersion: 'v0.0.0',
            symbolIds: Array.from(this._symbolIds),
            assets: Array.from(this.assets.values()).map(asset => asset.toPreBSON()),
            compositions: Array.from(this.compositions.values()).map(comp => comp.toPreBSON()),
        }
    }

    toJSON()
    {
        return {
            formatVersion: 'v0.0.0',
            symbolIds: Array.from(this._symbolIds),
            assets: Array.from(this.assets.values()).map(asset => asset.toJSON()),
            compositions: Array.from(this.compositions.values()).map(comp => comp.toJSON()),
        }
    }

    serialize()
    {
        return (new BSONPure.BSON()).serialize(this.toPreBSON())
    }
}

// export class ActionInvoker
// {
//     static ADD_NEW_COMPOSITION = (project: Project, request) => {
//         const _id = project._generateAndRegisterSymbolId();
//
//         project._commandHistory.push({
//             undo: () => {
//                 _.pullAt(_.findIndex(project.compositions, {id: _id}))
//             },
//             invoke: () => {
//                 const comp = new Composition(_id)
//                 project.compositions[_id] = comp._id
//             },
//             redo: () => {
//
//             }
//         })
//
//
//     }
// }
