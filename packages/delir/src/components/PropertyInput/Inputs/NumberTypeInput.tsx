import DragNumberInput from 'components/DragNumberInput/DragNumberInput'
import React, { useCallback, useState } from 'react'

interface Props {
  value: number
  float: boolean
  onChange: (value: number) => void
}

export const NumberTypeInput = ({ value, float, onChange }: Props) => {
  const [currentValue, setValue] = useState<number>(value)

  const handleChange = useCallback((value: number) => {
    setValue(value)
    onChange(value)
  }, [])

  return <DragNumberInput value={currentValue} allowFloat={float} onChange={handleChange} />
}
