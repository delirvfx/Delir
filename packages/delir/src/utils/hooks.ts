import Popper from 'popper.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useCallback } from 'react'
import { useTransition } from 'react-spring'
import { useImmer } from 'use-immer'

export const usePrevious = <T>(value: T): T | null => {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export const useMountTransition = (props: Parameters<typeof useTransition>[2]) => {
  const [mounted, setState] = useState(false)
  const transitions = useTransition(mounted, null, props)

  useLayoutEffect(() => {
    setState(true)
    return () => setState(false)
  })

  const { props: style } = transitions[0]!
  return { style }
}

type Validator = (errors: ValidationState) => void
type ValidationState = Record<string, string | null>

export const useValidation = (validator: Validator, deps: any[]) => {
  const [errors, setErrors] = useState<ValidationState>({})
  const isValid = useCallback(() => {
    const nextErrors = {}
    validator(nextErrors)
    setErrors(nextErrors)
    return Object.values(nextErrors).filter(value => value != null).length === 0
  }, [validator, ...deps])

  const setError = useCallback(
    (validator: Validator) => {
      const nextErrors = { ...errors }
      validator(nextErrors)
      setErrors(nextErrors)
    },
    [...deps],
  )

  return { errors, isValid, setError }
}

export const useObjectState = <T>(initialState: T) => {
  const [state, update] = useImmer<T>(initialState)

  const updater = useCallback((part: Partial<T>) => {
    update(draft => {
      Object.assign(draft, part)
    })
  }, [])

  return [state, updater] as const
}

export const usePopper = (options: Popper.PopperOptions = {}) => {
  const parentRef = useRef<Element | null>(null)
  const poppingRef = useRef<Element | null>(null)
  const popperRef = useRef<Popper | null>(null)

  useEffect(() => {
    if (!parentRef.current || !poppingRef.current) return
    const opt = Object.assign({}, options, {
      modifiers: {
        preventOverflow: { boundariesElement: document.body },
      },
    })
    popperRef.current = new Popper(parentRef.current.parentElement!.parentElement!, poppingRef.current!, opt)

    return () => {
      popperRef.current!.destroy()
    }
  }, [parentRef.current, poppingRef.current])

  return { parentRef, poppingRef }
}

export const useEscKeyListener = (callback: () => void, deps: any[] = []) => {
  const handleWindowKeyup = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback()
      }
    },
    [callback, ...deps],
  )

  useEffect(() => {
    window.addEventListener('keyup', handleWindowKeyup)
    return () => window.removeEventListener('keyup', handleWindowKeyup)
  }, [handleWindowKeyup])
}
