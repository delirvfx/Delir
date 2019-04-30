import { Branded } from '../helper/Branded'
import { Clip } from './Clip'
interface LayerProps {
    id?: string
    name: string
}
declare type LayerId = Branded<string, 'Entity/Layer/Id'>
declare class Layer implements LayerProps {
    public id: Layer.Id
    public name: string
    public clips: ReadonlyArray<Clip>
    constructor(props: LayerProps)
    public patch(props: Partial<LayerProps>): void
    public findClip(clipId: string): Clip | null
    public findClipAt(frame: number, durationFrame?: number): Clip | null
    public addClip(clip: Clip): boolean
    public removeClip(clipId: string): boolean
    public moveClipIntoLayer(clipId: string, destLayer: Layer): boolean
}
declare namespace Layer {
    type Id = LayerId
}
export { Layer }
