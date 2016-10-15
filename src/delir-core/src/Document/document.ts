/// <reference path="../struct/point-2d" />

import {BSONPure} from "bson";

export namespace Delir {
    export class Document {
        private document : Delir.Document.DocumentObject;

        constructor(serialized: Object = {})
        {
            // this.compositions = [];
        }

        serializeToBSON(): Buffer {
            const bson = new BSONPure.BSON();
            return bson.serialize(this);
        }

        deserialize(deserializedBson: Object): void {

        }

        // static deserialize(): Delir.Document {
        //     const bson = new BSONPure.BSON();
        //     return new Document();
        // }
    }
}

export namespace Delir.Document {
    export type DocumentObject = {
        assets : Array<AssetEntry|CompositionObject>
    };

    export type CompositionObject = {
        name : String;
        type : Delir.Document.AssetEntryType;
        layers : Array<Delir.Document.LayerObject>;
        config : Object;
    };

    export type LayerObject = {
        rendererId: String;
        parametors: Array<Delir.Document.TimeLineObject>;
    };

    export type TimeLineObject = {
        time: Number;
        value: Array<Number>|String|Number;
    };

    export type KeyFrameObject = {
        easeIn: Delir.Struct.Point2D;
        easeOut: Delir.Struct.Point2D;
    };

    export enum AssetEntryType {
        DIRECTRY = <any> 'ASSET_ENTRY_TYPE_DIRECTRY',
        FILE = <any> 'ASSET_ENTRY_TYPE_FILE',
        COMPOSITION = <any> 'ASSET_ENTRY_TYPE_COMPOSITION'
    };

    export type AssetEntry = {
        name : string;
        type : AssetEntryType;
        entries? : Array<AssetEntry>;
    };
}
