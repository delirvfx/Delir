import * as Delir from '@delirvfx/core'
import { Button } from 'components/Button/Button'
import { Portal } from 'components/Portal/Portal'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChromePicker, ColorChangeHandler, RGBColor } from 'react-color'
import styled from 'styled-components'
import { usePopper } from 'utils/hooks'
const s = {}

const ValuePreview = styled.div<{ bgColor: string }>`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1px solid #aaa;
  background-color: ${({ bgColor }) => bgColor};
`

export const ColorTypeInput = ({
  value,
  alpha,
  onChange,
}: {
  value: Delir.Values.ColorRGB | Delir.Values.ColorRGBA
  alpha: boolean
  onChange: (value: Delir.Values.ColorRGB | Delir.Values.ColorRGBA) => void
}) => {
  const soruceValue = useMemo(() => value, [value.toCSSColor()])
  const [currentColor, setColor] = useState<RGBColor>(soruceValue)
  const [opened, setOpened] = useState<boolean>(false)
  const { parentRef, poppingRef } = usePopper({ placement: 'right' })

  const handleChangeColor = useCallback<ColorChangeHandler>(color => {
    setColor(color.rgb)
  }, [])

  const handleClickOpenColorPicker = useCallback(() => {
    setOpened(true)
  }, [])

  const handleClickClose = useCallback(() => {
    const { r, g, b, a } = currentColor
    onChange(alpha ? new Delir.Values.ColorRGBA(r, g, b, a!) : new Delir.Values.ColorRGB(r, g, b))
    setOpened(false)
  }, [onChange, currentColor])

  useEffect(() => {
    setColor(soruceValue)
  }, [soruceValue.toCSSColor()])

  return (
    <>
      <ValuePreview ref={parentRef as any} bgColor={soruceValue.toCSSColor()} onClick={handleClickOpenColorPicker} />
      <Portal>
        <div style={{ visibility: opened ? 'visible' : 'hidden', pointerEvents: opened ? 'all' : 'none' }}>
          <div ref={poppingRef as any}>
            <ChromePicker color={currentColor} disableAlpha={!alpha} onChange={handleChangeColor} />
            <Button kind="primary" onClick={handleClickClose}>
              Close
            </Button>
          </div>
        </div>
      </Portal>
    </>
  )
}
