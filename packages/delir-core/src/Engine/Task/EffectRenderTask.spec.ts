import { mockClip, mockComposition, mockEffect, mockLayer, mockProject } from '../../../spec/mocks'
import { Clip, Project } from '../../Entity'
import { EffectPluginMissingException } from '../../Exceptions'
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
        project = mockProject()

        const comp = mockComposition()
        project.addComposition(comp)

        const layer = mockLayer()
        comp.addLayer(layer)

        clip = mockClip()
        layer.addClip(clip)
    })

    describe('ignoreMissingEffect', () => {
        it('Should not throw EffectPluginMissingException with missing effect', () => {
            const resolver = new DependencyResolver(project, registry)
            registry.registerPlugin([
                {
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
                            'delir-core': '*',
                        },
                    },
                    type: 'post-effect',
                },
            ])

            const effect = mockEffect({ processor: 'existing-effect' })
            clip.addEffect(effect)

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

            const effect = mockEffect({ processor: 'missing-processor' })
            clip.addEffect(effect)

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
