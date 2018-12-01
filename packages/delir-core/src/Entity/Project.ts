import { safeAssign } from '../helper/safeAssign'
import { Asset } from './Asset'
import { Clip } from './Clip'
import { Composition } from './Composition'
import { Layer } from './Layer'

export interface ProjectProps {
    formatVersion?: string
}

export class Project implements ProjectProps {
    public readonly formatVersion: string = '2017091401'
    public assets: ReadonlyArray<Asset> = []
    public compositions: ReadonlyArray<Composition> = []

    constructor(props: ProjectProps) {
        safeAssign<Project>(this, props)
    }

    public findAsset(assetId: string): Asset | null {
        return this.assets.find(asset => asset.id === assetId) || null
    }

    public addAsset(asset: Asset): void {
        this.assets = [...this.assets, asset]
    }

    public removeAsset(assetId: string): boolean {
        const beforeLength = this.assets.length
        this.assets = this.assets.filter(asset => asset.id !== assetId)
        return this.assets.length !== beforeLength
    }

    public findComposition(compositionId: string): Composition | null {
        return this.compositions.find(composition => composition.id === compositionId) || null
    }

    public addComposition(composition: Composition): boolean {
        if (this.compositions.findIndex(comp => comp.id === composition.id) !== -1) {
            return false
        }

        this.compositions = [...this.compositions, composition]
        return true
    }

    public removeComposition(compositionId: string): boolean {
        const beforeLength = this.compositions.length
        this.compositions = this.compositions.filter(composition => composition.id !== compositionId)
        return this.compositions.length !== beforeLength
    }

    public findLayer(layerId: string): Layer | null {
        for (const composition of this.compositions) {
            const layer = composition.findLayer(layerId)
            if (layer) return layer
        }

        return null
    }

    public findClip(clipId: string): Clip | null {
        for (const composition of this.compositions) {
            for (const layer of composition.layers) {
                const clip = layer.findClip(clipId)
                if (clip) return clip
            }
        }

        return null
    }

    public findLayerOwnerComposition(layerId: string): Composition | null {
        for (const composition of this.compositions) {
            if (composition.findLayer(layerId)) {
                return composition
            }
        }

        return null
    }

    public findClipOwnerLayer(clipId: string): Layer | null {
        for (const composition of this.compositions) {
            for (const layer of composition.layers) {
                if (layer.findClip(clipId)) {
                    return layer
                }
            }
        }

        return null
    }

    public findEffectOwnerClip(effectId: string): Clip | null {
        for (const composition of this.compositions) {
            for (const layer of composition.layers) {
                for (const clip of layer.clips) {
                    if (clip.findEffect(effectId)) {
                        return clip
                    }
                }
            }
        }

        return null
    }
}
