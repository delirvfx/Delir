import { boolean } from '@storybook/addon-knobs'
import React from 'react'
import { SelectBox } from './SelectBox'

export default {
  title: 'Components|Selectbox',
}

export const normal = () => (
  <SelectBox
    items={{ selection1: 'value', selection2: 'value2' }}
    value={'value2'}
    blocked={boolean('blocked', false)}
    small={boolean('small', false)}
  />
)
