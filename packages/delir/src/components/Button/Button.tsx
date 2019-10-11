import { darken } from 'polished'
import stlyed, { css } from 'styled-components'
import { cssVars } from '../../assets/styles/cssVars'

interface Props {
  kind?: 'normal' | 'primary'
}

const normal = css`
  background-color: #eee;

  &:hover {
    background-color: ${darken(0.2, '#eee')};
  }
`

const primary = css`
  background-color: #0081eb;
  color: #fff;

  &:hover {
    background-color: ${darken(0.2, '#0081eb')};
  }
`

export const Button = stlyed.button<Props>`
  padding: 4px 16px;
  transition: background-color ${cssVars.animate.bgColorDuration} ${cssVars.animate.function};
  border: 0;
  border-radius: 3px;
  outline: none;
  font-size: 12px;
  line-height: 16px;

  cursor: default;

  & + & {
    margin-left: 8px;
  }

  ${props => props.kind === 'normal' && normal}
  ${props => props.kind === 'primary' && primary}
`

Button.defaultProps = {
  kind: 'normal',
}
