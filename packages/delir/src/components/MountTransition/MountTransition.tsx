import React, { useEffect } from 'react'
import { AnimatedValue, useTransition } from 'react-spring'

type TransionOption = Parameters<typeof useTransition>[2]

interface Props extends TransionOption {
  children: (style: AnimatedValue<{}>) => JSX.Element
}

export const MountTransition = (props: Props): JSX.Element | null => {
  const [mounted, setState] = React.useState(false)
  const transitions = useTransition(mounted, null, props)

  useEffect(() => {
    setState(true)
    return () => setState(false)
  })

  const { props: style } = transitions[0]!
  return mounted ? props.children(style) : null
}
