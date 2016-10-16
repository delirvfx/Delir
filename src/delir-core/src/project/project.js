// @flow
import {BSONPure} from "bson"

export default class Project {
    // private document : Delir.Document.DocumentObject

    constructor(serialized: Object = {})
    {
        // this.compositions = []
    }

    toBson() {
        const bson = new BSONPure.BSON()
        return bson.serialize(this)
    }

    static deserialize(deserializedBson: Object) {

    }

    static deserialize(): Document {
        const bson = new BSONPure.BSON()
        return new Document()
    }
}
