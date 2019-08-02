import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import React, { useRef } from 'react'
import { Dropdown } from './index'

const Content = () => {
  const dropdownRef = useRef<Dropdown | null>(null)

  return (
    <div style={{ width: '200px' }} onClick={() => dropdownRef.current!.toggle()}>
      Show / Hide
      <Dropdown ref={dropdownRef}>
        <ul>
          <li>Menu 1</li>
          <li>Menu 2</li>
        </ul>
      </Dropdown>
    </div>
  )
}

storiesOf('Dropdown', module)
  .addDecorator(withKnobs)
  .add('Dropdown', () => {
    return <Content />
  })
