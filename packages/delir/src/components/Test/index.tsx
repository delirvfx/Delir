// import * as s from './style.sass'
import { connectToStores, ExecuteActionProp, Store } from '@ragg/fleur'
import * as React from 'react'
import EditorStore from '../../store/EditorStore'
import { increment } from '../../usecases/usecases'

const someAction = () => void 0

type Props = { count: number} & ExecuteActionProp

export default connectToStores([EditorStore], (ctx) => ({
    count: ctx.getStore(EditorStore).getCount(),
}))(
    class Test extends React.PureComponent<Props> {
        public render() {
            const { count } = this.props

            return (
                // <canvas ref={this.bindCanvas} onClick={this.handleOnClick} />
                <div onClick={this.handleOnClick}>{count}</div>
            )
        }

        private handleOnClick = () => {
            // this.props.context.getStore()
            this.props.context.executeOperation(increment, { })
            // this.props.context.executeAction(someAction, {})
        }

        // private canvas: HTMLCanvasElement

        // public render(): React.ReactNode {

        //     return (
        //         <Consumer>
        //             {context => (
        //                 <div onClick={this.handler.bind(null, context)}>
        //             )}
        //         </Consumer>
        //     )
        // }

        // handler() {
        //     this.props.context

        // }

        // private bindCanvas = (canvas: HTMLCanvasElement) => this.canvas = canvas
    }
)
