import { boolean } from '@storybook/addon-knobs'
import React from 'react'
import { SelectBox } from './SelectBox'

export default {
  title: 'Components|Selectbox',
}

export const normal = () => (
  <SelectBox value={'value2'} blocked={boolean('blocked', false)} small={boolean('small', false)}>
    <option value="value">selection1</option>
    <option value="value2">selection2</option>
  </SelectBox>
)
