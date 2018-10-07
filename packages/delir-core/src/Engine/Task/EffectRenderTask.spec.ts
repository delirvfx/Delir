import { Clip, Composition, Effect, Layer, Project } from '../../Entity'
import { EffectPluginMissingException } from '../../exceptions'
import PluginRegistry from '../../PluginSupport/plugin-registry'
import EffectPluginBase from '../../PluginSupport/PostEffectBase'
import DependencyResolver from '../DependencyResolver'
import { RenderContextBase } from '../RenderContext/RenderContextBase'
import EffectRenderTask from './EffectRenderTask'

describe('EffectRenderTask', () => {
    let project: Project
    let clip: Clip
    let registry: PluginRegistry

    beforeEach(() => {
        registry = new PluginRegistry()
        project = new Project()

        const comp = new Composition()
        project.compositions.push(comp)

        const layer = new Layer()
        comp.layers.push(layer)

        clip = new Clip()
        project.compositions[0].layers[0].clips.push(clip)
    })

    describe('ignoreMissingEffect', () => {
        it('Should not throw EffectPluginMissingException with missing effect', () => {
            const resolver = new DependencyResolver(project, registry)
            registry.registerPlugin([{
                id: 'existing-effect',
                class: EffectPluginBase as any,
                packageJson: {
                    name: 'existing-effect',
                    author: '',
                    version: '0.0.0',
                    delir: {
                        name: 'exit-effect',
                        type: 'post-effect',
                    },
                    engines: {
                        'delir-core': '0.5.x',
                    },
                },
                type: 'post-effect',
            }])

            const effect = new Effect()
            effect.processor = 'existing-effect'
            clip.effects.push(effect)

            const context = new RenderContextBase({
                rootComposition: project.compositions[0],
                durationFrames: 100,
            } as any)

            expect(() => {
                EffectRenderTask.build({
                    effect,
                    clip,
                    effectCache: new WeakMap(),
                    context,
                    resolver,
                })
            }).not.toThrow()
        })

        it('Should throw EffectPluginMissingException with missing effect', () => {

            const resolver = new DependencyResolver(project, registry)

            const effect = new Effect()
            effect.processor = 'missing-processor'
            clip.effects.push(effect)

            const context = new RenderContextBase({
                rootComposition: project.compositions[0],
                durationFrames: 100,
            } as any)

            expect(() => {
                EffectRenderTask.build({
                    effect,
                    clip,
                    effectCache: new WeakMap(),
                    context,
                    resolver,
                })
            }).toThrow(EffectPluginMissingException)
        })
    })
})
