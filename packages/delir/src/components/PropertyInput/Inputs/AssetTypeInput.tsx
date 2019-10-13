import * as Delir from '@delirvfx/core'
import { SelectBox } from 'components/SelectBox/SelectBox'
import React, { useCallback, useMemo, useState } from 'react'
import t from './Inputs.i18n'

interface Props {
  value: Delir.Values.AssetPointer
  assets: readonly Delir.Entity.Asset[]
  /** extensions without `.` prefix */
  accepts: string[]
  onChange: (value: Delir.Values.AssetPointer | null) => void
}

export const filterAcceptAssets = (assets: readonly Delir.Entity.Asset[], extensions: string[]) =>
  assets.filter(asset => extensions.includes(asset.fileType))

export const AssetTypeInput = ({ assets, value, accepts, onChange }: Props) => {
  const [currentId, setId] = useState<string | null>(value ? value.assetId : null)
  const acceptedAssets = useMemo(() => filterAcceptAssets(assets, accepts), [...assets, ...accepts])
  const handleChange = useCallback((value: string) => {
    setId(value)
    onChange(value == '' || value == null ? null : new Delir.Values.AssetPointer(value))
  }, [])

  return (
    <SelectBox small blocked value={currentId} onChange={handleChange}>
      {acceptedAssets.length == 0 ? (
        <option disabled selected>
          {t(t.k.noAssets)}
        </option>
      ) : (
        <>
          <option />
          {acceptedAssets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </>
      )}
    </SelectBox>
  )
}
