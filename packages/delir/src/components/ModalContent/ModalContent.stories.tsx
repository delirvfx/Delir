import React from 'react'
import styled from 'styled-components'
import { Button } from '../Button/Button'
import { ModalContent } from './ModalContent'

export default {
  title: 'ModalContent',
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: flex-start;
  justify-content: center;
  background-color: #222;
  --background: #353535;
`

export const normal = () => (
  <Wrapper>
    <ModalContent
      footer={
        <>
          <Button>Cancel</Button>
          <Button kind="primary">Continue</Button>
        </>
      }
    >
      <h1>Example modal</h1>
      Hi
    </ModalContent>
  </Wrapper>
)
