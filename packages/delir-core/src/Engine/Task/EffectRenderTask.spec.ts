import { Clip, Composition, Effect, Layer, Project } from '../../Entity'
import { EffectPluginMissingException } from '../../exceptions'
import PluginRegistry from '../../plugin-support/plugin-registry'
import EffectPluginBase from '../../plugin-support/PostEffectBase'
import DependencyResolver from '../DependencyResolver'
import RenderRequest from '../RenderRequest'
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
            registry.addEntries([{
                id: 'existing-effect',
                name: 'existing-effect',
                class: null as any,
                packageJson: {
                    name: 'existing-effect',
                    author: '',
                    version: '0.0.0',
                    delir: {
                        name: 'existing-effect',
                        type: 'post-effect',
                    },
                    engines: {
                        'delir-core': '0.4.0'
                    },
                },
                type: 'post-effect',
                entryPath: '',
                packageRoot: '',
                pluginInfo: {
                    name: 'existing-effect',
                    type: 'post-effect',
                }
            }])

            const effect = new Effect()
            effect.processor = 'missing-processor'
            clip.effects.push(effect)

            const request = new RenderRequest({
                rootComposition: project.compositions[0],
            })

            expect(() => {
                EffectRenderTask.build({
                    effect,
                    clip,
                    effectCache: new WeakMap(),
                    req: null as any,
                    resolver,
                })
            }).toThrow(EffectPluginMissingException)
        })

        it('Should throw EffectPluginMissingException with missing effect', () => {

            const resolver = new DependencyResolver(project, registry)

            const effect = new Effect()
            effect.processor = 'missing-processor'
            clip.effects.push(effect)

            const request = new RenderRequest({
                rootComposition: project.compositions[0],
            })

            expect(() => {
                EffectRenderTask.build({
                    effect,
                    clip,
                    effectCache: new WeakMap(),
                    req: null as any,
                    resolver,
                })
            }).toThrow(EffectPluginMissingException)
        })
    })
})
