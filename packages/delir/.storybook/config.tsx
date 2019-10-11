import { configure } from '@storybook/react'
import { addDecorator } from '@storybook/react'
import React from 'react'
import { createGlobalStyle } from 'styled-components'
import { cssVars } from '../src/assets/styles/cssVars'
import '../src/assets/styles/style.sass'
import './patch.sass'

const GlobalStyles = createGlobalStyle`
  body {
    --color-theming: ${cssVars.colors.theming};
  }
`

addDecorator(storyFn => (
  <>
    <GlobalStyles />
    {storyFn()}
  </>
))
configure(require.context('../src', true, /\.stories\.tsx$/), module)
