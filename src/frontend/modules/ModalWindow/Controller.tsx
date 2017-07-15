import * as React from 'react'
import Portal from '../Portal'
import ModalWindow from './ModalWindow'

export default class Modal {
    private portal: Portal|null
    private modal: ModalWindow|null

    constructor()
    {
        this.portal = new Portal()
    }

    public mount(element: JSX.Element)
    {
        this.modal = this.portal!.mount(
            <ModalWindow show={false}>{element}</ModalWindow>
        ) as ModalWindow
    }

    public dispose()
    {
        this.portal!.unmount()
        this.portal = null
        this.modal = null
    }

    public show()
    {
        return new Promise(resolve => {
            this.modal!.setState({show: true, onTransitionEnd: resolve})
        })
    }

    public hide(): Promise<void>
    {
        return new Promise(resolve => {
            this.modal!.setState({show: false, onTransitionEnd: resolve})
        })
    }
}
