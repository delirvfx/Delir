import { rgba } from 'polished'
import React, { InputHTMLAttributes, RefObject } from 'react'
import styled from 'styled-components'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  blocked?: boolean
  small?: boolean
  multiline?: boolean
}

const InlineInput = styled.input<Props>`
  display: ${props => (props.blocked ? 'block' : 'inline-block')};
  width: ${props => (props.blocked ? '100%' : 'auto')}
  padding: 4px;
  font-size: ${props => (props.small ? '12px' : '14px')};
  border-radius: 4px;
  border: none;
  font-family: inherit;
  outline: none;
  vertical-align: bottom;
  background-color: #555;
  caret-color: #ddd;

  &:hover {
  }
  &:focus,
  &:active {
    box-shadow: 0 0 0 2px ${rgba('#aa5bff', 0.4)};
  }
`

const TextArea = React.forwardRef((props: Props, ref) => <InlineInput as="textarea" ref={ref as any} {...props} />)

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(({ multiline, ...props }, ref) =>
  multiline ? (
    <TextArea ref={ref as RefObject<HTMLTextAreaElement>} {...props} />
  ) : (
    <InlineInput ref={ref as RefObject<HTMLInputElement>} {...props} />
  ),
)
