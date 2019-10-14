import { cssVars } from 'assets/styles/cssVars'
import styled from 'styled-components'

export const Checkbox = styled.input.attrs(() => ({ type: 'checkbox' }))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin: 0;
  overflow: hidden;

  text-align: center;
  vertical-align: middle;
  line-height: 14px;

  border: none;
  border-radius: ${cssVars.size.radius};
  background-color: #bbb;
  outline: none;
  transition: background-color ${cssVars.animate.function} ${cssVars.animate.bgColorDuration};

  -webkit-appearance: none;

  &::before {
    content: '✔';
    color: #bbb;
    line-height: 1;
  }

  &:checked {
    background-color: #007dff;

    &::before {
      color: #fff;
    }
  }
`
