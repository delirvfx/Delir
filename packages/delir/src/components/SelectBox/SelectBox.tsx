import { cssVars } from 'assets/styles/cssVars'
import { Icon } from 'components/Icon/Icon'
import React, { ReactNode, useCallback } from 'react'
import { ChangeEvent } from 'react'
import styled, { css } from 'styled-components'

interface Props {
  value: string | null
  small?: boolean
  blocked?: boolean
  children: ReactNode
  onChange?: (value: string) => void
}

const normalCss = css`
  padding: 4px;
  font-size: 14px;
  line-height: 24px;
`

const smallCss = css`
  padding: 2px;
  font-size: 12px;
  line-height: 1.4;
`

const Select = styled.select<{ small?: boolean }>`
  display: block;
  width: 100%;
  border: none;
  background: none;
  outline: none;
  appearance: none;
  background-color: #eee;
  color: #333;
  font-family: inherit;
  vertical-align: bottom;
  border-radius: ${cssVars.size.radius};
  ${({ small }) => (small ? smallCss : normalCss)}
  padding-right: ${({ small }) => (small ? '16px' : '24px')};

  &:focus,
  &:active {
    box-shadow: ${cssVars.style.activeBoxShadow};
  }
`

const Wrapper = styled.div<{ blocked?: boolean; small?: boolean }>`
  position: relative;
  display: ${({ blocked }) => (blocked ? 'block' : 'inline-block')};
  width: ${({ blocked }) => (blocked ? '100%' : 'auto')}
  appearance: none;
`

const DownArrow = styled(Icon)<{ small?: boolean }>`
  position: absolute;
  top: 50%;
  right: ${({ small }) => (small ? '4px' : '8px')};
  color: ${cssVars.colors.appBg};
  transform: translateY(-50%);
  pointer-events: none;
`

export const SelectBox = ({ value, small, blocked, onChange, children }: Props) => {
  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    onChange && onChange(e.currentTarget.value)
  }, [])

  return (
    <Wrapper small={small} blocked={blocked}>
      <Select value={value || undefined} small={small} onChange={handleChange}>
        {children}
      </Select>
      <DownArrow kind="angle-down" small={small} />
    </Wrapper>
  )
}
