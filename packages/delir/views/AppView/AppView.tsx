import { connectToStores, ContextProp, StoreGetter, withComponentContext } from '@ragg/fleur-react'
import * as Mousetrap from 'mousetrap'
import * as React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { makeMousetrapIgnoreInputHandler } from '../../utils/makeMousetrapHandler'
import { uiActionCopy, uiActionCut, uiActionPaste, uiActionRedo, uiActionUndo } from '../../utils/UIActions'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import Pane from '../../components/pane'
import Workspace from '../../components/workspace'

import AppMenu from '../AppMenu'
import AssetsView from '../AssetsView'
import { NavigationView } from '../NavigationView'
import { Notifications } from '../Notifications'
import { Preference } from '../Preference'
import PreviewView from '../PreviewView/'
import { RenderingWaiter } from '../RenderingWaiter'
import { StatusBar } from '../StatusBar'
import Timeline from '../Timeline'

import * as s from './style.styl'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

const mapStoresToProps = (getStore: StoreGetter) => ({
    preferenceOpened: getStore(EditorStore).getState().preferenceOpened,
    previewPlaying: getStore(RendererStore).previewPlaying,
})

export default withComponentContext(
    connectToStores([EditorStore, RendererStore], mapStoresToProps)(
        class AppView extends React.PureComponent<Props> {
            public root = React.createRef<HTMLDivElement>()
            public trap: InstanceType<typeof Mousetrap>

            public componentDidMount() {
                window.addEventListener('dragenter', this.prevent, false)
                window.addEventListener('dragover', this.prevent, false)

                this.trap = new Mousetrap(document.body)
                this.trap.bind('space', this.handleShortCutPreviewToggle)
                this.trap.bind(['mod+c'], this.handleShortCutCopy)
                this.trap.bind(['mod+x'], this.handleShortcutCut)
                this.trap.bind(['mod+v'], this.handleShortcutPaste)
                this.trap.bind(['mod+z'], this.handleShortCutUndo)
                this.trap.bind(['mod+shift+z'], this.handleShortCutRedo)

                window.setInterval(this.projectAutoSaveTimer, 3 * 60 * 1000) // 3min
            }

            public render() {
                const { preferenceOpened } = this.props

                return (
                    <div ref={this.root} className="_container" onDrop={this.prevent}>
                        <AppMenu />
                        <NavigationView />
                        <Workspace className="app-body" direction="vertical">
                            <Pane className="body-pane">
                                <Workspace direction="horizontal">
                                    <AssetsView />
                                    <PreviewView />
                                </Workspace>
                            </Pane>
                            <Timeline />
                        </Workspace>
                        <StatusBar />
                        <Notifications />
                        <RenderingWaiter />
                        <CSSTransitionGroup
                            component="div"
                            transitionEnterTimeout={400}
                            transitionLeaveTimeout={400}
                            transitionName={{
                                enter: s.preferenceEnter,
                                enterActive: s.preferenceEnterActive,
                                leave: s.preferenceLeave,
                                leaveActive: s.preferenceLeaveActive,
                            }}
                        >
                            {preferenceOpened && <Preference onClose={this.handlePreferenceClose} />}
                        </CSSTransitionGroup>
                    </div>
                )
            }

            private prevent = (e: any) => {
                e.preventDefault()
            }

            private projectAutoSaveTimer = () => {
                this.props.executeOperation(EditorOps.autoSaveProject, {})
            }

            private handlePreferenceClose = () => {
                this.props.executeOperation(EditorOps.changePreferenceOpenState, { open: false })
            }

            private handleShortCutPreviewToggle = (e: KeyboardEvent) => {
                if (
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return
                }

                const { previewPlaying } = this.props
                const activeComp = this.props.getStore(EditorStore).getActiveComposition()

                if (!activeComp) return

                if (previewPlaying) {
                    this.props.executeOperation(RendererOps.stopPreview, {})
                } else {
                    this.props.executeOperation(RendererOps.startPreview, {
                        compositionId: activeComp.id,
                    })
                }
            }

            private handleShortCutCopy = (e: KeyboardEvent) => {
                e.preventDefault()
                uiActionCopy()
            }

            private handleShortcutCut = (e: KeyboardEvent) => {
                e.preventDefault()
                uiActionCut()
            }

            private handleShortcutPaste = (e: KeyboardEvent) => {
                e.preventDefault()
                uiActionPaste()
            }

            // tslint:disable-next-line: member-ordering
            private handleShortCutUndo = makeMousetrapIgnoreInputHandler((e: KeyboardEvent) => {
                e.preventDefault()
                uiActionUndo(this.props.context)
            })

            // tslint:disable-next-line: member-ordering
            private handleShortCutRedo = makeMousetrapIgnoreInputHandler((e: KeyboardEvent) => {
                e.preventDefault()
                uiActionRedo(this.props.context)
            })
        },
    ),
)
