import * as uuid from 'uuid'

export default class Asset {
    public id: string
    public mimeType: string

    /** Asset file extension (without `.` prefix) */
    public fileType: string
    public name: string
    public path: string

    constructor() {
        this.id = uuid.v4()
    }
}
