import ClipComponent from '../Component/ClipComponent'
import { RenderingResult } from '../RenderingResult'

export default class ClipRenderWork {
    constructor(
        private clipComponent: ClipComponent
    ) { }

    public async perform(): Promise<RenderingResult> {
        if (this.isDepedingUnderLayer()) throw new Error('Invalid perfoming for ClipRenderWork, this clip ')

        this.clipComponent.renderer.beforeRender()
        this.clipComponent.renderer.render()

        return {
            canvas: null as any,
            audioBuffer: null,
        }
    }

    public async performWithBuffer(result: RenderingResult): Promise<RenderingResult> {
        return {
            canvas: null as any,
            audioBuffer: null,
        }
    }

    public isDepedingUnderLayer(): boolean {
        return this.clipComponent.ref.renderer === 'adjustment'
    }
}
