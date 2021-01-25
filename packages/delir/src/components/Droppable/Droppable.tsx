import { cssVars } from 'assets/styles/cssVars'
import React, { DetailedHTMLProps } from 'react'
import { DragEvent, ReactNode, useState } from 'react'
import { useCallback } from 'react'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Root = styled.div<{ dragover: boolean }>`
  background-color: ${({ dragover }) => (dragover ? cssVars.colors.dragover : 'transparent')};
  transition: background-color ${cssVars.animate.bgColorDuration} ${cssVars.animate.function};
`

export const Droppable = ({ children, className, onDragOver, onDragLeave, onDrop }: Props) => {
  const [dragover, setDragOver] = useState(false)

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (!e.dataTransfer.types.includes('Files')) return
      setDragOver(true)
      onDragOver && onDragOver(e)
    },
    [onDragOver],
  )

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      setDragOver(false)
      onDragLeave && onDragLeave(e)
    },
    [onDragLeave],
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      setDragOver(false)
      onDrop && onDrop(e)
    },
    [onDrop],
  )

  return (
    <Root
      className={className}
      dragover={dragover}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </Root>
  )
}
