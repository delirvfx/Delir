import React, { ReactNode, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

export const Portal = ({ children }: { children: ReactNode }) => {
  const root = useMemo(() => document.createElement('div'), [])

  useEffect(() => {
    document.body.appendChild(root)
    return () => {
      document.body.removeChild(root)
    }
  }, [])

  return <>{createPortal(children, root)}</>
}
