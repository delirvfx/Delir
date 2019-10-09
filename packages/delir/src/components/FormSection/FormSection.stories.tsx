import { withKnobs } from '@storybook/addon-knobs'
import React from 'react'
import { Input } from '../Input/Input'
import { FormSection } from './FormSection'

export default {
  title: 'FormSection',
  decorators: [withKnobs],
}

export const normal = () => (
  <>
    <FormSection label="Section name">
      <Input blocked />
    </FormSection>
    <FormSection label="Section name">
      <Input blocked />
    </FormSection>
  </>
)
