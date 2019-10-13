import { cssVars } from 'assets/styles/cssVars'
import { rgba } from 'polished'
import React, { InputHTMLAttributes, RefObject } from 'react'
import styled, { css } from 'styled-components'

interface Props extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  blocked?: boolean
  small?: boolean
  multiline?: boolean
  resize?: boolean
}

const normalCss = css`
  padding: 4px;
  font-size: 14px;
  line-height: 24px;
`

const smallCss = css`
  padding: 2px;
  font-size: 12px;
  line-height: 1.4;
`

const base = css<Props>`
  display: ${props => (props.blocked ? 'block' : 'inline-block')};
  width: ${props => (props.blocked ? '100%' : 'auto')}
  border-radius: ${cssVars.size.radius};
  border: none;
  font-family: inherit;
  outline: none;
  vertical-align: bottom;
  background-color: #eee;
  caret-color: #333;
  color: #333;
  resize: ${({ resize }) => (resize ? 'both' : 'none')}
  ${({ small }) => (small ? smallCss : normalCss)}

  &:hover {
  }
  &:focus,
  &:active {
    box-shadow: ${cssVars.style.activeBoxShadow};
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
