import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ReactNode } from 'react'
import { useTransition } from 'react-spring'

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
