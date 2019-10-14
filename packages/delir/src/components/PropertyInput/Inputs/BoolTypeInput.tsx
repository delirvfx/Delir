import { Checkbox } from 'components/Checkbox/Checkbox'
import React, { ChangeEvent, useCallback, useState } from 'react'

interface Props {
  value: boolean
  onChange: (value: boolean) => void
}

export const BoolTypeInput = ({ value, onChange }: Props) => {
  const [currentValue, setValue] = useState<boolean>(value)
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.currentTarget
    setValue(checked)
    onChange(checked)
  }, [])

  return <Checkbox checked={currentValue} onChange={handleChange} />
}
