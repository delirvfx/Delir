import { boolean, number, select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import React from 'react'
import DragNumberInput from './index'

storiesOf('DragNumberInput', module)
  .addDecorator(withKnobs)
  .add('DragNumberInput', () => {
    return (
      <div style={{ width: '200px' }}>
        <DragNumberInput value={number('value', 100)} disabled={boolean('disabled', false)} />
      </div>
    )
  })
