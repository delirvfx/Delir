import { rgba } from 'polished'
import React, { InputHTMLAttributes, ReactElement, ReactNode, RefObject } from 'react'
import styled, { css } from 'styled-components'

interface Props extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  blocked?: boolean
  small?: boolean
  multiline?: boolean
}

const base = css<Props>`
  display: ${props => (props.blocked ? 'block' : 'inline-block')};
  width: ${props => (props.blocked ? '100%' : 'auto')}
  padding: 4px;
  font-size: ${props => (props.small ? '12px' : '14px')};
  line-height: 24px;
  border-radius: 4px;
  border: none;
  font-family: inherit;
  outline: none;
  vertical-align: bottom;
  background-color: #555;
  caret-color: #eee;
  color: #eee;

  &:hover {
  }
  &:focus,
  &:active {
    box-shadow: 0 0 0 2px ${rgba('#aa5bff', 0.4)};
  }
`

const InlineInput = styled.input<Props>`
  ${base}
`

const TextArea = styled.textarea<Props>`
  ${base}
`

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(({ multiline, ...props }, ref) =>
  multiline ? (
    <TextArea ref={ref as RefObject<HTMLTextAreaElement>} {...props} />
  ) : (
    <InlineInput ref={ref as RefObject<HTMLInputElement>} {...props} />
  ),
)
