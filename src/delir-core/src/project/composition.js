// @flow
import Project from './project';
import Layer from './layer';

export default class Composition
{
    _id : string
    layers : Array<Layer> = []
    // config : Delir.Structs.CompositionConfigure = []

    get id(): string { return this._id }

    constructor(_id: string)
    {
        this._id = string
    }

    toJSON()
    {

    }
}
