import React, { ReactNode } from 'react'
import styled from 'styled-components'

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

export const FormSection = ({ label, children }: { label: string; children: ReactNode }) => (
  <Container>
    <Label>{label}</Label>
    <Content>{children}</Content>
  </Container>
)
