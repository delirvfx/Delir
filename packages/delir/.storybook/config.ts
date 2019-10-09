import { configure } from '@storybook/react'
import '../src/assets/styles/style.sass'
import './patch.sass'

configure(require.context('../src', true, /\.stories\.tsx$/), module)
