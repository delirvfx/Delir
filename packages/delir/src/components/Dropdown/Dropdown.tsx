import classnames from 'classnames'
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import s from './Dropdown.sass'

interface Props {
  shownInitial?: boolean
  className?: string
  children?: React.ReactNode
  hideOnClickOutside?: boolean
}

interface DropdownHandles {
  show(): void
  hide(): void
  toggle(): void
}

export type Dropdown = DropdownHandles

export const Dropdown = React.forwardRef<DropdownHandles, Props>(
  ({ children, className, shownInitial, hideOnClickOutside }: Props, ref) => {
    const inspector = useRef<HTMLDivElement | null>(null)
    const dropdownRoot = useRef<HTMLUListElement | null>(null)
    const [position, setPosition] = useState({ left: 0, top: 0 })
    const [show, setShow] = useState(shownInitial)

    const handleClickOutSide = useCallback((e: MouseEvent) => {
      if (hideOnClickOutside === false) return

      const path = e.composedPath() as Element[]
      const clickSelfOrChild = path.includes(dropdownRoot.current!)

      if (clickSelfOrChild) return
      setShow(false)
    }, [])

    useImperativeHandle(
      ref,
      (): DropdownHandles => ({
        show: () => setShow(true),
        hide: () => setShow(false),
        toggle: () => setShow(show => !show),
      }),
      [],
    )

    useEffect(() => {
      const { left, top } = inspector.current!.getBoundingClientRect()
      setPosition({ left, top })
    }, [])

    useEffect(() => {
      window.addEventListener('click', handleClickOutSide, { capture: true })
      return () => window.removeEventListener('click', handleClickOutSide, { capture: true })
    }, [])

    return (
      <>
        <div ref={inspector} className={s.dropdownInspector} />
        {createPortal(
          <div
            ref={dropdownRoot}
            className={classnames(s.dropdown, className, {
              [s['--shown']]: show,
            })}
            style={{ left: position.left, top: position.top }}
          >
            {children}
          </div>,
          document.body,
        )}
      </>
    )
  },
)
