import ClipComponent from '../Component/ClipComponent'
import { RenderingResult } from '../RenderingResult'

export default class ClipRenderWork {
    constructor(
        private clipComponent: ClipComponent
    ) { }

    public async perform(): Promise<RenderingResult> {
        return {
            canvas: null as any,
            audioBuffer: null,
        }
    }

    public isDepedingUnderLayer(): boolean {
        return this.clipComponent.ref.renderer === 'adjustment'
    }
}
