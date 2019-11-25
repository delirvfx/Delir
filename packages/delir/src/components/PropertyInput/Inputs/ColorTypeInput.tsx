import * as Delir from '@delirvfx/core'
import { cssVars } from 'assets/styles/cssVars'
import { Button } from 'components/Button/Button'
import { Portal } from 'components/Portal/Portal'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChromePicker, ColorChangeHandler, RGBColor } from 'react-color'
import styled from 'styled-components'
import { usePopper } from 'utils/hooks'
import t from './Inputs.i18n'

const ValuePreview = styled.div<{ bgColor: string }>`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1px solid #aaa;
  background-color: ${({ bgColor }) => bgColor};
`

const EditorWrapper = styled.div<{ opened: boolean }>`
  z-index: ${cssVars.zIndex.popup};
  padding: 4px;
  visibility: ${({ opened }) => (opened ? 'visible' : 'hidden')};
  pointer-events: ${({ opened }) => (opened ? 'all' : 'none')};
  background-color: ${cssVars.colors.popupBg};
  border-radius: ${cssVars.size.radius};

  .chrome-picker {
    box-shadow: none !important;
  }
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

  const handleClickOk = useCallback(() => {
    const { r, g, b, a } = currentColor
    onChange(alpha ? new Delir.Values.ColorRGBA(r, g, b, a!) : new Delir.Values.ColorRGB(r, g, b))
    setOpened(false)
  }, [onChange, alpha, currentColor])

  const handleClickDiscard = useCallback(() => {
    setColor(soruceValue)
    setOpened(false)
  }, [soruceValue.toCSSColor()])

  useEffect(() => {
    setColor(soruceValue)
  }, [soruceValue.toCSSColor()])

  return (
    <>
      <ValuePreview ref={parentRef as any} bgColor={soruceValue.toCSSColor()} onClick={handleClickOpenColorPicker} />
      <Portal>
        <EditorWrapper opened={opened} ref={poppingRef as any}>
          <ChromePicker
            color={{ r: currentColor.r, g: currentColor.g, b: currentColor.b, a: currentColor.a ?? 1 }}
            disableAlpha={!alpha}
            onChange={handleChangeColor}
          />
          <div style={{ marginTop: '4px' }}>
            <Button kind="primary" onClick={handleClickOk}>
              {t(t.k.ok)}
            </Button>
            <Button kind="normal" onClick={handleClickDiscard}>
              {t(t.k.discard)}
            </Button>
          </div>
        </EditorWrapper>
      </Portal>
    </>
  )
}
