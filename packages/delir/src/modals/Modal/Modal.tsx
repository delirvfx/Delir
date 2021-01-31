import classnames from 'classnames'
import React, { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from 'react'
import s from './Modal.sass'
import { ModalController } from './ModalController'

export interface Props {
  show?: boolean
  closable?: boolean
  children?: ReactNode
  query?: { [name: string]: string | number }
  onHide?: () => any
}

export const show = <T extends JSX.Element = any>(component: T, props: Props = { show: true }): ModalController => {
  const controller = new ModalController()
  controller.mount(<Modal {...props}>{component}</Modal>)
  return controller
}

export const Modal = forwardRef(({ closable = true, onHide, query, show = false, children }: Props, ref) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(show)

  useImperativeHandle(
    ref,
    () => ({
      toggleShow({ show, onTransitionEnd }: { show: boolean; onTransitionEnd: () => void }) {
        setShown(show)
        rootRef.current!.addEventListener('transitionend', () => onTransitionEnd(), { once: true })
      },
    }),
    [],
  )

  return (
    <div
      ref={rootRef}
      className={classnames(s.root, {
        [s['--show']]: shown,
      })}
    >
      {children}
    </div>
  )
})
