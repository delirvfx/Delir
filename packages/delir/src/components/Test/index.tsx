import * as React from 'react'
// import * as s from './style.sass'

export default class Test extends React.Component {
    private canvas: HTMLCanvasElement

    public render(): React.ReactNode {
        return (
            <canvas ref={this.bindCanvas} />
        )
    }


    private bindCanvas = (canvas: HTMLCanvasElement) => this.canvas = canvas
}
