import Asset from './asset'

export type ProjectData = {
    formatVersion: string,
    assets : Array<AssetEntry>,
    compositions: Array<CompositionData>,
    preference: Object,
}

export type AssetEntry = {
    name : string,
    type : AssetEntryType,
    entries : Array<AssetEntry>,
}

export type AssetEntryType = {
   DIRECTRY: 'ASSET_ENTRY_TYPE_DIRECTRY',
   FILE: 'ASSET_ENTRY_TYPE_FILE',
}

export type CompositionData = {
    name : string,
    clips : Array<ClipData>,
    preference : Object,
}

export type ClipData = {
    rendererId: string,
    clipOptions: Object,
    parametors: Array<TimeLineObject>,
}

 export type TimeLineObject = {

}

export type KeyFrameObject = {
    time: number,
    value: Array<string|number>,

    // completionType:
    easeIn?: {x: Number, y: Number},
    easeOut?: {x: Number, y: Number},
}

export type ProjectPreference = {

}

export type RendererProperties = {[propName: string]: Asset|string|number}