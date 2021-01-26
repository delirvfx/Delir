import { useChangedEffect } from '@hanakla/arma'
import classnames from 'classnames'
import _ from 'lodash'
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useObjectState } from 'utils/hooks'
import { Platform } from 'utils/platform'

import s from './DragNumberInput.sass'

interface Props {
  className?: string
  min?: number
  max?: number
  name?: string
  value?: string | number
  disabled?: boolean
  allowFloat?: boolean
  onChange?: (value: number) => any
  doubleClickToEdit?: boolean
}

interface State {
  value: number | string
}

export default memo(function DragNumberInput({
  allowFloat = false,
  className,
  disabled = false,
  doubleClickToEdit = false,
  max,
  min,
  name,
  onChange,
  value: propsValue = 0,
}: Props) {
  const [state, setState] = useObjectState<State>({
    value: propsValue ?? 0,
  })

  const inputRef = useRef<HTMLInputElement | null>(null)
  const pointerLocked = useRef<boolean>(false)
  const noEmitChangeOnBlur = useRef<boolean>(false)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current!

    if (e.key === 'Enter') {
      e.preventDefault()

      const value = parseValue(e.currentTarget.value)
      setState({ value })
      inputRef.current!.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()

      noEmitChangeOnBlur.current = true
      setState({ value: propsValue ?? 0 })
      inputRef.current!.blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()

      const value = parseValue(e.currentTarget.value) + (e.altKey ? 0.1 : 1)
      setState({ value })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()

      const value = parseValue(e.currentTarget.value) - (e.altKey ? 0.1 : 1)
      setState({ value })
    }
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    let value = parseValue(inputRef.current!.value)

    if (inputRef.current!.value.trim() === '') {
      value = propsValue != null ? parseValue(propsValue) : 0
      noEmitChangeOnBlur.current = true
    }

    setState({ value })

    if (noEmitChangeOnBlur.current === false) onChange?.(value)
    noEmitChangeOnBlur.current = false
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (e.nativeEvent.which !== 1) return // not mouse left pressed

    // requestPointerLock() on input element brokes input cursor behaviour
    // So delay pointerLock until movement occurs
    if (Math.abs(e.nativeEvent.movementX) > 1) {
      e.currentTarget.requestPointerLock()
      pointerLocked.current = true
    } else {
      return
    }

    let weight = 0.3

    if (e.ctrlKey) {
      weight = 0.05
    } else if (e.shiftKey) {
      weight = 2
    }

    const value = parseValue(inputRef.current!.value) + e.nativeEvent.movementX * weight
    setState({ value: parseValue(value) })
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const input = inputRef.current!

    if (pointerLocked.current) {
      document.exitPointerLock()
      input.blur()
    }

    pointerLocked.current = false
  }, [])

  // TODO: parse and calculate expression
  const handleChangeValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    setState({ value })
  }, [])

  const parseValue = useCallback(
    (rawValue: number | string): number => {
      const parsedValue = parseFloat(rawValue as string)
      let value = Number.isNaN(parsedValue) ? 0 : parsedValue

      if (!allowFloat) {
        value = Math.round(value)
      } else {
        value = Math.round(value * 100) / 100
      }

      return value
    },
    [allowFloat],
  )

  useEffect(() => {
    inputRef.current!.onpointerlockerror = (e) => console.error('Pointer lock error', e)
  }, [])

  useChangedEffect(() => {
    setState({ value: propsValue })
  }, [propsValue])

  return (
    <input
      ref={inputRef}
      type="text"
      className={classnames(s.DragNumberInput, className)}
      value={state.value}
      onBlur={handleBlur}
      onChange={handleChangeValue}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
})
