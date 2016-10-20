// @flow
import _ from 'lodash'
import uuid from 'uuid'
import {BSONPure} from 'bson'

import Asset from './asset'
import Composition from './composition'

export default class Project
{
    _symbolIds: Array<string>
    _assets: Array<Asset>
    _compositions: Array<Composition>

    // static deserialize(deserializedBson: Object)
    // {
    //
    // }
    //
    // static deserialize(): Document {
    //     const bson = new BSONPure.BSON()
    //     return new Document()
    // }

    constructor()
    {
        this._symbolIds = []
        this._assets = []
        this._compositions = []
    }

    _generateAndRegisterSymbolId(): string
    {
        let id;
        do {
            id = uuid.v4()
        } while (this._symbolIds.includes(id))

        this._symbolIds.push(id)
        return id
    }

    newComposition(): string
    {
        const _id = this._generateAndRegisterSymbolId()
        const comp = new Composition(_id)
    }

    findComposition(_id: string)
    {
        return _.find(this._compositions, {_id})
    }

    toBson()
    {
        const bson = new BSONPure.BSON()
        return bson.serialize(this)
    }
}
