import Asset from './asset'

export interface ProjectData {
    formatVersion: string,
    assets : Array<AssetEntry>,
    compositions: Array<CompositionData>,
    preference: Object,
}

export interface AssetEntry {
    name : string,
    type : AssetEntryType,
    entries : Array<AssetEntry>,
}

export interface AssetEntryType {
   DIRECTRY: 'ASSET_ENTRY_TYPE_DIRECTRY',
   FILE: 'ASSET_ENTRY_TYPE_FILE',
}

export interface CompositionData {
    name : string,
    clips : Array<ClipData>,
    preference : Object,
}

export interface ClipData {
    rendererId: string,
    clipOptions: Object,
    parametors: Array<TimeLineObject>,
}

 export interface TimeLineObject {

}

export interface KeyFrameObject {
    time: number,
    value: Array<string | number>,

    // completionType:
    easeIn?: {x: Number, y: Number},
    easeOut?: {x: Number, y: Number},
}

export interface ProjectPreference {

}

export interface RendererProperties {[propName: string]: Asset | string | number}