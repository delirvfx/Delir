import { cssVars } from 'assets/styles/cssVars'
import { Button } from 'components/Button/Button'
import { Dropdown } from 'components/Dropdown/Dropdown'
import { Input } from 'components/Input/Input'
import { rgba } from 'polished'
import React, { ChangeEvent, KeyboardEvent, useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import t from './Inputs.i18n'

interface Props {
  value: string
  onChange: (value: string) => void
}

const TextareaWrapper = styled.div`
  padding: 4px;
  background-color: ${cssVars.colors.popupBg};
  border-radius: ${cssVars.size.radius};
`

export const StringTypeInput = ({ value, onChange }: Props) => {
  const sourceValue = useRef<string>(value)
  const [currentValue, setValue] = useState<string>(value)
  const dropdownRef = useRef<Dropdown | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleFocusToPreview = () => {
    dropdownRef.current!.show()
    textareaRef.current!.focus()
  }

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.currentTarget.value)
  }, [])

  const handleKeydown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'Enter') {
        dropdownRef.current!.hide()
        onChange(currentValue)
      }
    },
    [currentValue],
  )

  const handleClickOk = useCallback(() => {
    dropdownRef.current!.hide()
    onChange(currentValue)
  }, [currentValue])

  const handleClickDiscard = useCallback(() => {
    dropdownRef.current!.hide()
    setValue(sourceValue.current)
  }, [])

  return (
    <div>
      <Dropdown ref={dropdownRef} hideOnClickOutside={false}>
        <TextareaWrapper>
          <Input
            small
            multiline
            ref={textareaRef}
            value={currentValue as string}
            style={{ width: '30vw', height: '6em' }}
            onChange={handleChange}
            onKeyDown={handleKeydown}
          />
          <div style={{ marginTop: '4px' }}>
            <Button kind="primary" onClick={handleClickOk}>
              {t(t.k.okWithShortcutKey)}
            </Button>
            <Button kind="normal" onClick={handleClickDiscard}>
              {t(t.k.discard)}
            </Button>
          </div>
        </TextareaWrapper>
      </Dropdown>
      <Input
        small
        type="text"
        onFocus={handleFocusToPreview}
        value={value as string}
        readOnly
        style={{
          width: '100%',
          color: rgba('#000', 0.5),
        }}
      />
    </div>
  )
}
