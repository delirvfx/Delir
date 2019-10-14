import { Values } from '@delirvfx/core'
import { boolean } from '@storybook/addon-knobs'
import React from 'react'
import { ColorTypeInput } from './Inputs/ColorTypeInput'
import { StringTypeInput } from './Inputs/StringTypeInput'

export default {
  title: 'PropertyInput',
}

export const color = () => {
  const alpha = boolean('alpha', false)
  const value = alpha ? new Values.ColorRGBA(0, 0, 0, 1) : new Values.ColorRGB(0, 0, 0)
  return <ColorTypeInput alpha={alpha} value={value} onChange={() => {}} />
}

export const string = () => {
  return <StringTypeInput value={'Lorem ipsum'} onChange={() => {}} />
}
