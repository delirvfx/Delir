import * as Delir from '@delirvfx/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BoolTypeInput } from './Inputs/BoolTypeInput'
import { ColorTypeInput } from './Inputs/ColorTypeInput'
import { NumberTypeInput } from './Inputs/NumberTypeInput'
import { StringTypeInput } from './Inputs/StringTypeInput'

const s = {} as any

interface Props {
  assets: ReadonlyArray<Delir.Entity.Asset> | null
  descriptor: Delir.AnyParameterTypeDescriptor
  value: Delir.Entity.KeyframeValueTypes
  onChange: (desc: Delir.AnyParameterTypeDescriptor, value: Delir.Entity.KeyframeValueTypes) => void
}

export const PropertyInput = ({ assets, descriptor, value, onChange }: Props) => {
  const handleOnChange = useCallback(
    (value: Delir.Entity.KeyframeValueTypes) => {
      onChange(descriptor, value)
    },
    [onChange],
  )

  switch (descriptor.type) {
    case 'COLOR_RGB':
    case 'COLOR_RGBA':
      return <ColorTypeInput value={value as any} alpha={descriptor.type === 'COLOR_RGBA'} onChange={handleOnChange} />

    case 'BOOL':
      return <BoolTypeInput value={value as any} onChange={handleOnChange} />

    case 'FLOAT':
    case 'NUMBER':
      return <NumberTypeInput value={value as any} float={descriptor.type === 'FLOAT'} onChange={handleOnChange} />

    case 'STRING':
      return <StringTypeInput value={value as any} onChange={handleOnChange} />

    case 'ENUM':
      return null

    case 'ASSET':
      return null

    case 'CODE':
      return null

    default:
      return null
  }
}
