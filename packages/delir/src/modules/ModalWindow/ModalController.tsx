import React from 'react'
import Portal from '../Portal/Portal'
import { ModalWindow, Props } from './ModalWindow'

export class ModalController {
  private portal: Portal | null
  private modal: ModalWindow | null
  private modalOption: Props

  constructor(modalOption: Props = {}) {
    this.portal = new Portal()
    this.modalOption = modalOption
  }

  public mount(element: JSX.Element) {
    this.modal = this.portal!.mount(
      <ModalWindow show={false} {...this.modalOption}>
        {element}
      </ModalWindow>,
    ) as ModalWindow
  }

  public dispose() {
    this.portal!.unmount()
    this.portal = null
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
