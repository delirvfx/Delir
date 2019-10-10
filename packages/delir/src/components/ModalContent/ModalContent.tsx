import React, { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  min-width: 500px;
  width: 70vw;
  padding: 24px 16px 16px;
  background: var(--background);
  border-radius: 4px;

  h1 {
    font-size: 24px;
    line-height: 32px;
    margin-bottom: 16px;
  }
`

const Footer = styled.div`
  display: flex
  align-items: center
  justify-content: flex-end
  margin-top: 24px
`

export const ModalContent = ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
  <Container>
    {children}
    <Footer>{footer}</Footer>
  </Container>
)
