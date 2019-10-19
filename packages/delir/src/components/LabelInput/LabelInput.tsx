import { cssVars } from 'assets/styles/cssVars'
import classnames from 'classnames'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { propsToDataset, propsToDatasetArray } from '../../utils/propsToDataset'

interface Props {
  className?: string
  name?: string
  defaultValue?: string
  placeholder?: string
  onChange?: (value: string, dataset: object) => void
  doubleClickToEdit?: boolean
}

interface LabelInputHandles {
  enableAndFocus(): void
}

const Input = styled.input`
  display: inline-block;
  min-width: 1rem;
  min-height: 1em;
  color: inherit;
  font-family: inherit;
  background-color: transparent;
  font-size: 12px;
  border: 0;
  border-bottom: 1px solid var(--color-theming);
  outline: none;
  transition: border-bottom-color 0.1s;

  &[readonly] {
    border-bottom: 1px solid transparent;
    cursor: default;
    user-select: none;

    &:focus {
      border-bottom: 1px solid rgba(${cssVars.colors.theming}, 0.3);
    }
  }
`

export type LabelInput = LabelInputHandles

export const LabelInput = forwardRef<LabelInputHandles, Props>((props: Props, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState(props.defaultValue)
  const [readonly, setReadonly] = useState(true)
  const propsDataset = useMemo(() => propsToDataset(props), propsToDatasetArray(props))

  const handleChangeValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { onChange, defaultValue } = props
      const input = inputRef.current!

      if (e.key === 'Enter' && !(e.nativeEvent as any).isComposing) {
        if (readonly) {
          setReadonly(false)
        } else {
          onChange && onChange(input.value, propsDataset)
          setReadonly(true)
          setValue(input.value)
        }
      } else if (e.key === 'Escape') {
        onChange && onChange(input.value, propsDataset)
        setReadonly(true)
        setValue(defaultValue)
      }
    },
    [props.onChange, props.defaultValue, propsDataset],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { onChange } = props

      if (readonly) return

      onChange && onChange(inputRef.current!.value, propsDataset)
      setReadonly(true)
    },
    [readonly, props.onChange, propsDataset],
  )

  useImperativeHandle(
    ref,
    () => ({
      enableAndFocus: () => {
        setReadonly(false)
        setTimeout(() => {
          inputRef.current!.focus()
          inputRef.current!.select()
        })
      },
    }),
    [],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (!props.doubleClickToEdit) return

      e.preventDefault()
      e.stopPropagation()

      setReadonly(false)
      inputRef.current!.focus()
      inputRef.current!.select()
    },
    [props.doubleClickToEdit],
  )

  useEffect(() => {
    setValue(props.defaultValue)
  }, [props.defaultValue])

  useEffect(() => {
    if (readonly) {
      inputRef.current!.blur()
    } else {
      inputRef.current!.focus()
    }
  }, [readonly])

  return (
    <Input
      ref={inputRef}
      type="text"
      tabIndex={-1}
      className={classnames('_label-input', props.className)}
      name={props.name}
      value={value}
      placeholder={props.placeholder}
      readOnly={readonly}
      onChange={handleChangeValue}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onDoubleClick={handleDoubleClick}
    />
  )
})

LabelInput.defaultProps = {
  doubleClickToEdit: false,
}
