// import * as s from './style.sass'
import { ExecuteActionProp, Store, withExecuteAction } from '@ragg/fleur'
import * as React from 'react'

const someAction = () => void 0

export default withExecuteAction(
    class Test extends React.Component<ExecuteActionProp> {
        private handleOnClick = () => {
            this.props.executeAction(someAction, {})
        }

        private canvas: HTMLCanvasElement

        public render(): React.ReactNode {
            return (
                <canvas ref={this.bindCanvas} onClick={this.handleOnClick} />
            )
        }

        private bindCanvas = (canvas: HTMLCanvasElement) => this.canvas = canvas
    }
)
