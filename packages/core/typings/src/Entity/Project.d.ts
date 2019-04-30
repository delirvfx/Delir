import { Asset } from './Asset'
import { Clip } from './Clip'
import { Composition } from './Composition'
import { Layer } from './Layer'
export interface ProjectProps {
    formatVersion?: string
}
export declare class Project implements ProjectProps {
    public readonly formatVersion: string
    public assets: ReadonlyArray<Asset>
    public compositions: ReadonlyArray<Composition>
    constructor(props: ProjectProps)
    public findAsset(assetId: string): Asset | null
    public addAsset(asset: Asset): void
    public removeAsset(assetId: string): boolean
    public findComposition(compositionId: string): Composition | null
    public addComposition(composition: Composition): boolean
    public removeComposition(compositionId: string): boolean
    public findLayer(layerId: string): Layer | null
    public findClip(clipId: string): Clip | null
    public findLayerOwnerComposition(layerId: string): Composition | null
    public findClipOwnerLayer(clipId: string): Layer | null
    public findEffectOwnerClip(effectId: string): Clip | null
}
