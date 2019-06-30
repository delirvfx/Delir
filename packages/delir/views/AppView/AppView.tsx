import { connectToStores, ContextProp, StoreGetter, withFleurContext } from '@fleur/fleur-react'
import * as React from 'react'
import { animated, Transition } from 'react-spring/renderprops'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
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
import { ShortcutHandler } from './ShortcutHandler'

import * as s from './style.styl'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

const mapStoresToProps = (getStore: StoreGetter) => ({
    preferenceOpened: getStore(EditorStore).getState().preferenceOpened,
})

export default withFleurContext(
    connectToStores([EditorStore, RendererStore], mapStoresToProps)(
        class AppView extends React.PureComponent<Props> {
            public root = React.createRef<HTMLDivElement>()
            public trap: InstanceType<typeof Mousetrap>

            public componentDidMount() {
                window.addEventListener('dragenter', this.prevent, false)
                window.addEventListener('dragover', this.prevent, false)

                window.setInterval(this.projectAutoSaveTimer, 3 * 60 * 1000) // 3min
            }

            public render() {
                const { preferenceOpened } = this.props

                return (
                    <div ref={this.root} className="_container" onDrop={this.prevent}>
                        <ShortcutHandler />
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
                        <Transition
                            items={preferenceOpened}
                            from={{ opacity: 0, transform: 'scale(1.2)' }}
                            enter={{ opacity: 1, transform: 'scale(1)' }}
                            leave={{ opacity: 0, transform: 'scale(1.2)' }}
                        >
                            {opened =>
                                opened &&
                                (style => (
                                    <animated.div className={s.preference} style={style}>
                                        <Preference onClose={this.handlePreferenceClose} />
                                    </animated.div>
                                ))
                            }
                        </Transition>
                    </div>
                )
            }

            private prevent = (e: any) => {
                e.preventDefault()
            }

            private projectAutoSaveTimer = () => {
                this.props.executeOperation(EditorOps.autoSaveProject)
            }

            private handlePreferenceClose = () => {
                this.props.executeOperation(EditorOps.changePreferenceOpenState, { open: false })
            }
        },
    ),
)
