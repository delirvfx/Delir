import ClipComponent from '../Component/ClipComponent'
import CompositionScopeFrameContext from '../FrameContext/CompositionScopeFrameContext'
import { RenderingResult } from '../RenderingResult'
import TargetComponentFinder from '../TargetComponentFinder'
import ClipRenderWork from './ClipRenderWork'

export default class CompositionRenderWork {
    public async perform(
        finder: TargetComponentFinder,
        context: CompositionScopeFrameContext,
    ): Promise<RenderingResult> {
        // TODO: Audio preprocessing
        const works = this.toClipRenderWorkFromLayers(finder.targets.layers)
        const results = await this.runWorks(works)
        return this.mergeLayers(results)
    }

    private toClipRenderWorkFromLayers(layers: (ClipComponent | null)[]): ClipRenderWork[][] {
        const appearLayers = layers.filter(clip => clip != null) as ClipComponent[]
        const layerWorks = appearLayers
            .reverse() // for `for ... of ...` and respect rendering order
            .map(clip => new ClipRenderWork(clip))

        // Groups of no dependency work group
        const queue: ClipRenderWork[][] = []

        // Group of Works with order dependence
        let group: ClipRenderWork[] = []

        for (const work of layerWorks) {
            if (work.isDepedingUnderLayer()) {
                queue.push(group)
                group = []
                continue
            }

            group.push(work)
        }

        group.length !== 0 && queue.push()

        return queue
    }

    private runWorks(works: ClipRenderWork[][]): Promise<RenderingResult[][]> {
        const resultsPromises: Promise<RenderingResult[]>[] = []

        for (const group of works) {
            let groupPromises: Promise<RenderingResult>[] = []

            for (const work of group) {
                // TODO: Adjustment clip support
                groupPromises.push(work.perform())
            }

            resultsPromises.push(Promise.all(groupPromises))
        }

        return Promise.all(resultsPromises)
    }
}
