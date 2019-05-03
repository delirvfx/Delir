import * as Delir from '@delirvfx/core'
import { operation } from '@ragg/fleur'
import * as _ from 'lodash'
import * as uuid from 'uuid'
import { safeAssign } from '../../utils/safeAssign'
import { SpreadType } from '../../utils/Spread'

import EditorStore from '../Editor/EditorStore'
import * as EditorOps from '../Editor/operations'
import * as HistoryOps from '../History/operations'
import RendererStore from '../Renderer/RendererStore'
import { ProjectActions } from './actions'
import ProjectStore from './ProjectStore'

import { AddAssetCommand } from './Commands/AddAssetCommand'
import { AddClipCommand } from './Commands/AddClipCommand'
import { AddEffectIntoClipCommand } from './Commands/AddEffectIntoClipCommand'
import { AddEffectKeyframeCommand } from './Commands/AddEffectKeyframeCommand'
import { AddKeyframeCommand } from './Commands/AddKeyframeCommand'
import { AddLayerCommand } from './Commands/AddLayerCommand'
import { CreateCompositionCommand } from './Commands/CreateCompositionCommand'
import { ModifyClipExpressionCommand } from './Commands/ModifyClipExpressionCommand'
import { ModifyClipKeyframeCommand } from './Commands/ModifyClipKeyframeCommand'
import { ModifyClipsCommand, ModifyClipsPatches } from './Commands/ModifyClipsCommand'
import { ModifyCompositionCommand } from './Commands/ModifyCompositionCommand'
import { ModifyEffectCommand } from './Commands/ModifyEffectCommand'
import { ModifyEffectExpressionCommand } from './Commands/ModifyEffectExpressionCommand'
import { ModifyEffectKeyframeCommand } from './Commands/ModifyEffectKeyframeCommand'
import { ModifyLayerCommand } from './Commands/ModifyLayerCommand'
import { MoveClipToLayerCommand } from './Commands/MoveClipToLayerCommand'
import { MoveLayerOrderCommand } from './Commands/MoveLayerOrderCommand'
import { RemoveAssetCommand } from './Commands/RemoveAssetCommand'
import { RemoveClipCommand } from './Commands/RemoveClipCommand'
import { RemoveCompositionCommand } from './Commands/RemoveCompositionCommand'
import { RemoveEffectCommand } from './Commands/RemoveEffectCommand'
import { RemoveEffectKeyframeCommand } from './Commands/RemoveEffectKeyframeCommand'
import { RemoveKeyframeCommand } from './Commands/RemoveKeyframeCommand'
import { RemoveLayerCommand } from './Commands/RemoveLayerCommand'

//
// Modify project
//
// @deprecated
export const createComposition = operation(
    async (
        context,
        options: {
            name: string
            width: number
            height: number
            framerate: number
            durationFrames: number
            backgroundColor: Delir.Values.ColorRGB
            samplingRate: number
            audioChannels: number
        },
    ) => {
        const composition = new Delir.Entity.Composition(options)
        composition.addLayer(new Delir.Entity.Layer({ name: '' }))

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new CreateCompositionCommand(composition),
        })
        context.dispatch(ProjectActions.createCompositionAction, {
            composition,
        })
    },
)

export const addLayer = operation(
    async (
        context,
        {
            targetCompositionId,
            index = 0,
            patch = {},
        }: {
            targetCompositionId: string
            index?: number
            patch?: Partial<Delir.Entity.Layer>
        },
    ) => {
        const layer = new Delir.Entity.Layer({ name: patch.name || '' })

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new AddLayerCommand(targetCompositionId, layer, index),
        })

        context.dispatch(ProjectActions.addLayerAction, {
            targetCompositionId: targetCompositionId,
            layer,
            index,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const addLayerWithAsset = operation(
    async (
        context,
        {
            targetComposition,
            index = 0,
            asset,
        }: {
            targetComposition: SpreadType<Delir.Entity.Composition>
            index?: 0
            asset: Delir.Entity.Asset
        },
    ) => {
        const processableRenderer = Delir.Engine.Renderers.getAvailableRenderers().filter(entry => {
            return entry.handlableFileTypes.includes(asset.fileType)
        })[0]

        if (!processableRenderer) {
            context.executeOperation(EditorOps.notify, {
                message: `plugin not available for \`${asset.fileType}\``,
                title: '😢 Supported plugin not available',
                level: 'info',
                timeout: 5000,
            })

            return
        }

        const assignablePropName = Delir.Engine.Renderers.getInfo(processableRenderer.id as any).assetAssignMap[
            asset.fileType
        ]
        if (assignablePropName == null) return

        const layer = new Delir.Entity.Layer({ name: '' })
        const clip = safeAssign(
            new Delir.Entity.Clip({
                renderer: processableRenderer.id as any,
                placedFrame: 0,
                durationFrames: targetComposition.framerate,
            }),
            {
                keyframes: {
                    [assignablePropName]: [
                        safeAssign(
                            new Delir.Entity.Keyframe({
                                frameOnClip: 0,
                                value: { assetId: asset.id },
                            }),
                        ),
                    ],
                },
            },
        )

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new AddLayerCommand(targetComposition.id, layer, index),
        })

        context.dispatch(ProjectActions.addLayerWithAssetAction, {
            targetCompositionId: targetComposition.id,
            clip,
            asset,
            layer,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const addClip = operation(
    async (
        context,
        {
            layerId,
            clipRendererId,
            placedFrame,
            durationFrames = 100,
        }: {
            layerId: string
            clipRendererId: string
            placedFrame?: number
            durationFrames: number
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const composition = project.findLayerOwnerComposition(layerId)!
        const { currentPreviewFrame } = context.getStore(EditorStore).getState()

        const newClip = new Delir.Entity.Clip({
            renderer: clipRendererId as any,
            placedFrame: placedFrame ? placedFrame : currentPreviewFrame,
            durationFrames: durationFrames,
        })

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new AddClipCommand(composition.id, layerId, newClip),
        })

        context.dispatch(ProjectActions.addClipAction, {
            newClip,
            targetLayerId: layerId,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const addClipWithAsset = operation(
    async (
        context,
        {
            targetLayerId,
            asset,
            placedFrame = 0,
            durationFrames = 100,
        }: {
            targetLayerId: string
            asset: Delir.Entity.Asset
            placedFrame?: number
            durationFrames?: number
        },
    ) => {
        const processablePlugin = Delir.Engine.Renderers.getAvailableRenderers().filter(entry =>
            entry.handlableFileTypes.includes(asset.fileType),
        )[0]

        // TODO: Support selection
        if (!processablePlugin) {
            context.executeOperation(EditorOps.notify, {
                message: `plugin not available for \`${asset.fileType}\``,
                title: '😢 Supported plugin not available',
                level: 'info',
                timeout: 3000,
            })

            return
        }

        const paramName = Delir.Engine.Renderers.getInfo(processablePlugin.id as any).assetAssignMap[asset.fileType]
        if (!paramName) return

        const newClip = safeAssign(
            new Delir.Entity.Clip({
                renderer: processablePlugin.id,
                placedFrame,
                durationFrames,
            }),
            {
                keyframes: {
                    [paramName]: [
                        new Delir.Entity.Keyframe({
                            frameOnClip: 0,
                            value: { assetId: asset.id },
                        }),
                    ],
                },
            },
        )

        const project = context.getStore(ProjectStore).getProject()!
        const parentComposition = project.findLayerOwnerComposition(targetLayerId)!

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new AddClipCommand(parentComposition.id, targetLayerId, newClip),
        })

        context.dispatch(ProjectActions.addClipAction, {
            targetLayerId: targetLayerId,
            newClip,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const createOrModifyClipKeyframe = operation(
    async (
        context,
        {
            clipId,
            paramName,
            frameOnClip,
            patch,
        }: {
            clipId: string
            paramName: string
            frameOnClip: number
            patch: Partial<Delir.Entity.Keyframe>
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const clip = project.findClip(clipId)!

        const props = Delir.Engine.Renderers.getInfo(clip.renderer!).parameter.properties
        const propDesc = props ? props.find(prop => prop.paramName === paramName) : null
        if (!propDesc) return

        frameOnClip = frameOnClip < 0 ? 0 : Math.round(frameOnClip)

        if (propDesc.animatable === false) {
            frameOnClip = 0
        }

        const keyframe = clip.findKeyframeAtFrame(paramName, frameOnClip)

        if (keyframe) {
            await context.executeOperation(HistoryOps.pushHistory, {
                command: new ModifyClipKeyframeCommand(keyframe.id, { ...keyframe }, patch, clipId, paramName),
            })

            context.dispatch(ProjectActions.modifyKeyframeAction, {
                parentClipId: clip.id,
                targetKeyframeId: keyframe.id,
                patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
            })
        } else {
            const newKeyframe = new Delir.Entity.Keyframe({
                frameOnClip,
                ...patch,
            } as Delir.Entity.Keyframe)

            await context.executeOperation(HistoryOps.pushHistory, {
                command: new AddKeyframeCommand(clipId, paramName, newKeyframe),
            })

            context.dispatch(ProjectActions.addKeyframeAction, {
                targetClipId: clip.id,
                paramName,
                keyframe: newKeyframe,
            })
        }

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const createOrModifyKeyframeForEffect = operation(
    async (
        context,
        {
            clipId,
            effectId,
            paramName,
            frameOnClip,
            patch,
        }: {
            clipId: string
            effectId: string
            paramName: string
            frameOnClip: number
            patch: Partial<Delir.Entity.Keyframe>
        },
    ) => {
        const rendererStore = context.getStore(RendererStore)
        const project = context.getStore(ProjectStore).getProject()!
        const clip = project.findClip(clipId)!
        const effect = clip.findEffect(effectId)!

        const props = rendererStore.getPostEffectParametersById(effect.processor)
        const propDesc = props ? props.find(prop => prop.paramName === paramName) : null
        if (!propDesc) return

        if (propDesc.animatable === false) {
            frameOnClip = 0
        }

        const keyframe = effect.findKeyframeAtFrame(paramName, frameOnClip)

        if (keyframe) {
            await context.executeOperation(HistoryOps.pushHistory, {
                command: new ModifyEffectKeyframeCommand(
                    clipId,
                    effectId,
                    paramName,
                    keyframe.id,
                    { ...keyframe },
                    patch,
                ),
            })

            context.dispatch(ProjectActions.modifyEffectKeyframeAction, {
                targetClipId: clipId,
                effectId: effectId,
                targetKeyframeId: keyframe.id,
                patch: propDesc.animatable === false ? Object.assign(patch, { frameOnClip: 0 }) : patch,
            })
        } else {
            const newKeyframe = safeAssign(
                new Delir.Entity.Keyframe({
                    frameOnClip,
                    ...(patch as Delir.Entity.Keyframe),
                }),
            )

            await context.executeOperation(HistoryOps.pushHistory, {
                command: new AddEffectKeyframeCommand(clipId, effectId, paramName, newKeyframe),
            })

            context.dispatch(ProjectActions.addEffectKeyframeAction, {
                targetClipId: clipId,
                targetEffectId: effectId,
                paramName,
                keyframe: newKeyframe,
            })
        }

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const addAsset = operation(
    async (
        context,
        {
            name,
            fileType,
            path,
        }: {
            name: string
            fileType: string
            path: string
        },
    ) => {
        const asset = new Delir.Entity.Asset({ name, fileType, path })
        await context.executeOperation(HistoryOps.pushHistory, {
            command: new AddAssetCommand(asset),
        })
        context.dispatch(ProjectActions.addAssetAction, { asset })
    },
)

export const addEffectIntoClip = operation(
    async (
        context,
        {
            clipId,
            processorId,
        }: {
            clipId: string
            processorId: string
        },
    ) => {
        const effect = new Delir.Entity.Effect({ processor: processorId })

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new AddEffectIntoClipCommand(clipId, effect),
        })

        context.dispatch(ProjectActions.addEffectIntoClipAction, {
            clipId: clipId,
            effect,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const removeAsset = operation(async (context, { assetId }: { assetId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const asset = project.findAsset(assetId)!

    await context.executeOperation(HistoryOps.pushHistory, {
        command: new RemoveAssetCommand(asset),
    })

    context.dispatch(ProjectActions.removeAssetAction, {
        targetAssetId: assetId,
    })
})

export const moveClipToLayer = operation(
    async (
        context,
        {
            clipId,
            destLayerId,
        }: {
            clipId: string
            destLayerId: string
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const sourceLayer = project.findClipOwnerLayer(clipId)!
        const parentComposition = project.findLayerOwnerComposition(sourceLayer.id)!

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new MoveClipToLayerCommand(sourceLayer.id, destLayerId, clipId, parentComposition.id),
        })

        context.dispatch(ProjectActions.moveClipToLayerAction, {
            destLayerId: destLayerId,
            clipId: clipId,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const modifyComposition = operation(
    async (
        context,
        {
            compositionId,
            patch,
        }: {
            compositionId: string
            patch: Partial<Delir.Entity.Composition>
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const composition = project.findComposition(compositionId)!

        if (_.isMatch(composition, patch)) return

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new ModifyCompositionCommand(compositionId, { ...composition }, patch),
        })

        context.dispatch(ProjectActions.modifyCompositionAction, {
            targetCompositionId: compositionId,
            patch,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const modifyLayer = operation(
    async (
        context,
        {
            layerId,
            patch,
        }: {
            layerId: string
            patch: Partial<Delir.Entity.Layer>
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const layer = project.findLayer(layerId)!
        const parentComposition = project.findLayerOwnerComposition(layer.id)!

        if (_.isMatch(layer, patch)) return

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new ModifyLayerCommand(layerId, { ...layer }, patch, parentComposition.id),
        })

        context.dispatch(ProjectActions.modifyLayerAction, {
            targetLayerId: layerId,
            patch: patch,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

/** @deprecated */
export const modifyClip = operation(
    async (
        context,
        {
            clipId,
            patch,
        }: {
            clipId: string
            patch: Partial<Delir.Entity.Clip>
        },
    ) => {
        await context.executeOperation(modifyClips, [{ clipId, patch }])
    },
)

export const modifyClips = operation(
    async (context, patches: { clipId: string; patch: Partial<Delir.Entity.Clip> }[]) => {
        const project = context.getStore(ProjectStore).getProject()!
        const comp = context.getStore(EditorStore).activeComp!

        const effectivePatches: ModifyClipsPatches = []

        patches.forEach(({ clipId, patch }) => {
            const clip = project.findClip(clipId)
            if (!clip || _.isMatch(clip, patch)) return

            effectivePatches.push({
                clipId,
                patch,
                unpatched: { ...clip },
            })
        })

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new ModifyClipsCommand(comp.id, effectivePatches),
        })

        context.dispatch(ProjectActions.modifyClipsAction, {
            patches: effectivePatches,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const modifyEffect = operation(
    async (
        context,
        {
            clipId,
            effectId,
            patch,
        }: {
            clipId: string
            effectId: string
            patch: Partial<Delir.Entity.Effect>
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const effect = project.findClip(clipId)!.findEffect(effectId)!

        if (_.isMatch(effect, patch)) return

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new ModifyEffectCommand(clipId, effectId, { ...effect }, patch),
        })

        context.dispatch(ProjectActions.modifyEffectAction, {
            parentClipId: clipId,
            targetEffectId: effectId,
            patch,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const modifyClipExpression = operation(
    async (
        context,
        {
            clipId,
            paramName,
            expr,
        }: {
            clipId: string
            paramName: string
            expr: { language: string; code: string }
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const clip = project.findClip(clipId)!

        const newExpression = new Delir.Values.Expression(expr.language, expr.code)

        if (_.isMatch(clip.expressions[paramName], newExpression)) return

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new ModifyClipExpressionCommand(clipId, paramName, clip.expressions[paramName], newExpression),
        })

        context.dispatch(ProjectActions.modifyClipExpressionAction, {
            targetClipId: clipId,
            targetParamName: paramName,
            expression: newExpression,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const modifyEffectExpression = operation(
    async (
        context,
        {
            clipId,
            effectId,
            paramName,
            expr,
        }: {
            clipId: string
            effectId: string
            paramName: string
            expr: { language: string; code: string }
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const clip = project.findClip(clipId)!
        const effect = clip.findEffect(effectId)!

        const newExpression = new Delir.Values.Expression(expr.language, expr.code)

        if (_.isMatch(effect.expressions[paramName], newExpression)) return

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new ModifyEffectExpressionCommand(
                clipId,
                effectId,
                paramName,
                effect.expressions[paramName],
                newExpression,
            ),
        })

        context.dispatch(ProjectActions.modifyEffectExpressionAction, {
            targetClipId: clipId,
            targetEffectId: effectId,
            paramName: paramName,
            expression: newExpression,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const moveLayerOrder = operation(
    async (context, { layerId, newIndex }: { layerId: string; newIndex: number }) => {
        const project = context.getStore(ProjectStore).getProject()!
        const comp = project.findLayerOwnerComposition(layerId)!

        const previousIndex = comp.layers.findIndex(layer => layer.id === layerId)

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new MoveLayerOrderCommand(comp.id, layerId, previousIndex, newIndex),
        })

        context.dispatch(ProjectActions.moveLayerOrderAction, {
            parentCompositionId: comp.id,
            targetLayerId: layerId,
            newIndex,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const moveEffectOrder = operation((context, { effectId, newIndex }: { effectId: string; newIndex: number }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const clip = project.findEffectOwnerClip(effectId)

    if (!clip) return

    context.dispatch(ProjectActions.moveEffectOrderAction, {
        parentClipId: clip.id,
        subjectEffectId: effectId,
        newIndex,
    })
})

export const removeComposition = operation(async (context, { compositionId }: { compositionId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const composition = project.findComposition(compositionId)!

    await context.executeOperation(HistoryOps.pushHistory, {
        command: new RemoveCompositionCommand(composition),
    })

    context.dispatch(ProjectActions.removeCompositionAction, {
        targetCompositionId: compositionId,
    })
})

export const removeLayer = operation(async (context, { layerId }: { layerId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const removingLayer = project.findLayer(layerId)!
    const parentComposition = project.findLayerOwnerComposition(layerId)!
    const index = parentComposition.layers.findIndex(layer => layer.id === removingLayer.id)

    await context.executeOperation(HistoryOps.pushHistory, {
        command: new RemoveLayerCommand(parentComposition.id, removingLayer, index),
    })

    context.dispatch(ProjectActions.removeLayerAction, {
        targetLayerId: layerId,
    })

    await context.executeOperation(EditorOps.seekPreviewFrame, {})
})

export const removeClip = operation(async (context, { clipId }: { clipId: string }) => {
    const project = context.getStore(ProjectStore).getProject()!
    const parentLayer = project.findClipOwnerLayer(clipId)!
    const composition = project.findLayerOwnerComposition(parentLayer.id)!
    const clip = project.findClip(clipId)!

    await context.executeOperation(HistoryOps.pushHistory, {
        command: new RemoveClipCommand(parentLayer.id, clip, composition.id),
    })

    context.dispatch(ProjectActions.removeClipAction, {
        targetClipId: clip.id,
    })

    await context.executeOperation(EditorOps.seekPreviewFrame, {})
})

export const removeKeyframe = operation(
    async (context, { clipId, paramName, keyframeId }: { clipId: string; paramName: string; keyframeId: string }) => {
        const project = context.getStore(ProjectStore).getProject()!
        const clip = project.findClip(clipId)!
        const keyframe = clip.findKeyframe(keyframeId)!

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new RemoveKeyframeCommand(clip.id, paramName, keyframe),
        })
        context.dispatch(ProjectActions.removeKeyframeAction, {
            parentClipId: clip.id,
            paramName,
            targetKeyframeId: keyframe.id,
        })
        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const removeEffectKeyframe = operation(
    async (
        context,
        {
            clipId,
            effectId,
            paramName,
            keyframeId,
        }: {
            clipId: string
            effectId: string
            paramName: string
            keyframeId: string
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const keyframe = project
            .findClip(clipId)!
            .findEffect(effectId)!
            .findKeyframe(keyframeId)!

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new RemoveEffectKeyframeCommand(clipId, effectId, paramName, keyframe),
        })

        context.dispatch(ProjectActions.removeEffectKeyframeAction, {
            clipId,
            effectId,
            paramName,
            targetKeyframeId: keyframeId,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

export const removeEffect = operation(
    async (
        context,
        {
            holderClipId,
            effectId,
        }: {
            holderClipId: string
            effectId: string
        },
    ) => {
        const project = context.getStore(ProjectStore).getProject()!
        const holderClip = project.findClip(holderClipId)!
        const effect = holderClip.findEffect(effectId)!
        const index = holderClip.effects.findIndex(effect => effect.id === effectId)

        await context.executeOperation(HistoryOps.pushHistory, {
            command: new RemoveEffectCommand(holderClipId, effect, index),
        })

        context.dispatch(ProjectActions.removeEffectFromClipAction, {
            holderClipId,
            targetEffectId: effectId,
        })

        await context.executeOperation(EditorOps.seekPreviewFrame, {})
    },
)

// Clipboard operations
export const pasteClipEntityIntoLayer = operation(async (context, { layerId }: { layerId: string }) => {
    const entry = context.getStore(EditorStore).getClipboardEntry()
    if (!entry || entry.type !== 'clip') return

    const project = context.getStore(ProjectStore).getProject()!
    const placedFrame = context.getStore(EditorStore).getState().currentPreviewFrame
    const composition = project.findLayerOwnerComposition(layerId)!

    const clipProps = Delir.Exporter.deserializeEntity(entry.entityClone) as Delir.Entity.Clip
    const clip = new Delir.Entity.Clip({
        ...clipProps,
        id: uuid.v4(),
        placedFrame,
    })

    // Regenerate ids
    clip.effects.forEach(effect => {
        effect.id = uuid.v4() as Delir.Entity.Effect.Id
    })

    _.each(clip.keyframes, keyframes => {
        keyframes.forEach(keyframe => {
            keyframe.id = uuid.v4() as Delir.Entity.Keyframe.Id
        })
    })

    await context.executeOperation(HistoryOps.pushHistory, {
        command: new AddClipCommand(composition.id, layerId, clip),
    })

    context.dispatch(ProjectActions.addClipAction, {
        targetLayerId: layerId,
        newClip: clip,
    })

    await context.executeOperation(EditorOps.seekPreviewFrame, {})
})
