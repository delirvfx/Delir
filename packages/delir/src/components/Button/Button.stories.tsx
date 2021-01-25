import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { Button } from './Button'

storiesOf('Components|Button', module)
  .addDecorator(withKnobs)
  .add('Button', () => {
    const label = text('label', 'Hello!')
    return (
      <Button kind={select('kind', { normal: 'normal', primary: 'primary' }, 'normal')} onClick={() => {}}>
        {label}
      </Button>
    )
  })
