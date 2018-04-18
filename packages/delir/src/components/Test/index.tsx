import { Engine } from '@ragg/delir-core'
import { Store } from '@ragg/fleur'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as React from 'react'

import EditorStore from '../../store/EditorStore'
import RendererStore from '../../store/RendererStore'
import * as s from './style.sass'

const someAction = () => void 0

type Props = { count: number } & ContextProp

export default withComponentContext(connectToStores([EditorStore, RendererStore], (ctx) => ({}))(
    class Test extends React.PureComponent<Props> {
        private canvasRef = React.createRef<HTMLCanvasElement>()
        private canvasCtx: CanvasRenderingContext2D

        public componentDidMount() {
            const canvas = this.canvasRef.current
            this.canvasCtx = canvas.getContext('2d')!

            const engine: Engine = this.props.context.getStore(RendererStore).getEngine()
            engine.observeFrame((frame) => {
                this.canvasCtx.drawImage(frame, 0, 0, canvas.width, canvas.height)
            })

            engine.render()
        }

        public render() {
            const { count } = this.props

            return (<>
                <canvas ref={this.canvasRef} />
                <div>hi</div>
            </>)
        }
    }
))
