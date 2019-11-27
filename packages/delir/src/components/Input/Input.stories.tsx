import { boolean, text, withKnobs } from '@storybook/addon-knobs'
import React from 'react'
import { Input } from './Input'

export default {
  title: 'Components|Input',
  decorators: [withKnobs],
}

export const normal = () => (
  <Input
    type={text('type', 'text')}
    small={boolean('small', false)}
    blocked={boolean('blocked', false)}
    placeholder={text('placeholder', 'Hold in place')}
  />
)
export const multiline = () => (
  <Input
    multiline
    small={boolean('small', false)}
    blocked={boolean('blocked', false)}
    placeholder={text('placeholder', 'Hold in place')}
  />
)
