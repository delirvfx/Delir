import * as Delir from '@delirvfx/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AssetTypeInput } from './Inputs/AssetTypeInput'
import { BoolTypeInput } from './Inputs/BoolTypeInput'
import { ColorTypeInput } from './Inputs/ColorTypeInput'
import { EnumTypeInput } from './Inputs/EnumTypeInput'
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
      return (
        <ColorTypeInput
          value={value as Delir.Values.ColorRGB | Delir.Values.ColorRGBA}
          alpha={descriptor.type === 'COLOR_RGBA'}
          onChange={handleOnChange}
        />
      )

    case 'BOOL':
      return <BoolTypeInput value={value as boolean} onChange={handleOnChange} />

    case 'FLOAT':
    case 'NUMBER':
      return <NumberTypeInput value={value as number} float={descriptor.type === 'FLOAT'} onChange={handleOnChange} />

    case 'STRING':
      return <StringTypeInput value={value as string} onChange={handleOnChange} />

    case 'ENUM':
      return <EnumTypeInput items={descriptor.selection} value={value as any} onChange={handleOnChange} />

    case 'ASSET':
      return (
        <AssetTypeInput
          value={value as Delir.Values.AssetPointer}
          assets={assets || []}
          accepts={descriptor.extensions}
          onChange={handleOnChange}
        />
      )

    case 'CODE':
      return null

    default:
      return null
  }
}
