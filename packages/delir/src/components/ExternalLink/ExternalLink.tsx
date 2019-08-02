import { remote } from 'electron'
import React, { useCallback } from 'react'

interface Props {
  href: string
  className?: string
  children: React.ReactChild
}

export const ExternalLink = (props: Props) => {
  const { href, className, children } = props

  const openLink = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      remote.shell.openExternal(href)
      e.preventDefault()
    },
    [href],
  )

  return (
    <a href={href} className={className} onClick={openLink}>
      {children}
    </a>
  )
}
