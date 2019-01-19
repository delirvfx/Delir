import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as Mousetrap from 'mousetrap'
import * as React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { makeMousetrapIgnoreInputHandler } from '../../utils/makeMousetrapHandler'
import { uiActionCopy, uiActionCut, uiActionPaste, uiActionRedo, uiActionUndo } from '../../utils/UIActions'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as HistoryOps from '../../domain/History/operations'

import Pane from '../../components/pane'
import Workspace from '../../components/workspace'

import AppMenu from '../AppMenu'
import AssetsView from '../AssetsView'
import NavigationView from '../NavigationView'
import Notifications from '../Notifications'
import Preference from '../Preference'
import PreviewView from '../PreviewView/'
import RenderingWaiter from '../RenderingWaiter'
import StatusBar from '../StatusBar'
import Timeline from '../Timeline'

import * as s from './style.styl'

interface ConnectedProps {
    editor: EditorState
}

type Props = ConnectedProps & ContextProp

export default withComponentContext(
    connectToStores([EditorStore], context => ({
        editor: context.getStore(EditorStore).getState(),
    }))(
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
                const { preferenceOpened } = this.props.editor

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
                this.props.context.executeOperation(EditorOps.autoSaveProject, {})
            }

            private handlePreferenceClose = () => {
                this.props.context.executeOperation(EditorOps.changePreferenceOpenState, { open: false })
            }

            private handleShortCutPreviewToggle = (e: KeyboardEvent) => {
                if (
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return
                }

                const { previewPlayed, activeComp, currentPreviewFrame } = this.props.editor

                if (!activeComp) return

                if (previewPlayed) {
                    this.props.context.executeOperation(EditorOps.stopPreview, {})
                } else {
                    this.props.context.executeOperation(EditorOps.startPreview, {
                        compositionId: activeComp.id,
                        beginFrame: currentPreviewFrame,
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
