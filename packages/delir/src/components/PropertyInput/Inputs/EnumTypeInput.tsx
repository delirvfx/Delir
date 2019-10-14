import { SelectBox } from 'components/SelectBox/SelectBox'
import React, { useCallback } from 'react'
import { useMemo, useState } from 'react'

interface Props {
  value: string
  items: string[]
  onChange: (value: string) => void
}

export const EnumTypeInput = ({ value, items, onChange }: Props) => {
  const [currentValue, setValue] = useState(value)

  const handleChange = useCallback(
    (value: string) => {
      onChange(value)
      setValue(value)
    },
    [value, onChange],
  )

  return (
    <SelectBox small blocked value={currentValue} onChange={handleChange}>
      {items.map(item => (
        <option value={item}>{item}</option>
      ))}
    </SelectBox>
  )
}
