import React from 'react'
import ReactDOM from 'react-dom'
import { Modal, Props } from './Modal'

export class ModalController {
  private container: HTMLDivElement | null
  private modal: Modal | null
  private modalOption: Props

  constructor(modalOption: Props = {}) {
    this.container = document.createElement('div')
    this.modalOption = modalOption
  }

  public mount(element: JSX.Element) {
    if (!this.container) {
      throw new Error('ModalController already disposed')
    }

    ReactDOM.render(
      <Modal show={false} {...this.modalOption}>
        {element}
      </Modal>,
      this.container,
    )

    document.body.appendChild(this.container)
  }

  public dispose() {
    if (!this.container) return

    ReactDOM.unmountComponentAtNode(this.container)

    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }

    this.container = null!
    this.modal = null
  }

  public show() {
    return new Promise(resolve => {
      this.modal!.toggleShow({ show: true, onTransitionEnd: resolve })
    })
  }

  public hide(): Promise<void> {
    return new Promise(resolve => {
      this.modal!.toggleShow({ show: false, onTransitionEnd: resolve })
    })
  }
}
