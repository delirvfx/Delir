import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { cssVars } from '../../assets/styles/cssVars'

interface Props {
  label: ReactNode
  error?: string | null
  children?: ReactNode
}

const Container = styled.label`
  display: block;

  & + & {
    margin-top: 16px;
  }
`

const Label = styled.span`
  display: block;
  margin-bottom: 4px;
`

const Content = styled.div`
  display: block;
`

const Error = styled.div`
  display: block;
  margin-top: 4px;
  line-height: 1.5;
  color: ${cssVars.colors.error};
`

export const FormSection = ({ label, error, children }: Props) => (
  <Container>
    <Label>{label}</Label>
    <Content>{children}</Content>
    {error && <Error>{error}</Error>}
  </Container>
)
