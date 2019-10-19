import { useFleurContext, useStore } from '@fleur/react'
import { cssVars } from 'assets/styles/cssVars'
import { FormSection } from 'components/FormSection/FormSection'
import { getDevPluginDirs } from 'domain/Preference/selectors'
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { Button } from 'components/Button/Button'
import * as PreferecenOps from 'domain/Preference/operations'
import PreferenceStore from 'domain/Preference/PreferenceStore'
import { useImmer } from 'use-immer'
import { selectFile } from 'utils/selectFile'
import t from './Plugin.i18n'

const DirList = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: ${cssVars.colors.listArea};
  border-radius: 4px;
`

const Entry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px
  border-radius: 4px;

  & + & {
    margin-top: 4px;
  }

  &:hover {
    background-color: ${cssVars.colors.listItemHovered};
  }
`

const DirEntry = ({ path, onRemove }: { path: string; onRemove: (path: string) => void }) => {
  const handleRemove = useCallback(() => {
    onRemove(path)
  }, [path, onRemove])

  return (
    <Entry>
      <div>{path}</div>
      <Button kind="normal" onClick={handleRemove}>
        {t(t.k.remove)}
      </Button>
    </Entry>
  )
}

export const DevelopmentPlguinPane = () => {
  const { executeOperation } = useFleurContext()
  const { currentDirs } = useStore([PreferenceStore], getStore => ({
    currentDirs: getDevPluginDirs(getStore),
  }))
  const [{ dirs }, update] = useImmer({ dirs: currentDirs })

  const handleAdd = useCallback(async () => {
    const [dir] = await selectFile({ directory: true })
    update(draft => {
      draft.dirs.push(dir.path)
    })
  }, [update])

  const handleRemoveDir = useCallback(
    (removalPath: string) => {
      update(draft => {
        draft.dirs = draft.dirs.filter(p => p !== removalPath)
      })
    },
    [update],
  )

  useEffect(() => {
    executeOperation(PreferecenOps.setDevPluginDirectories, dirs)
  }, [dirs])

  return (
    <>
      <h2>{t(t.k.title)}</h2>
      <FormSection label={t(t.k.watchesTitle)} labelType="div">
        <DirList>
          {dirs.length === 0 ? (
            <Entry style={{ color: cssVars.textColors.muted }}>{t(t.k.noEntry)}</Entry>
          ) : (
            dirs.map(dir => <DirEntry path={dir} onRemove={handleRemoveDir} />)
          )}
        </DirList>
        <div style={{ marginTop: '8px' }}>
          <Button type="button" onClick={handleAdd}>
            {t(t.k.add)}
          </Button>
        </div>
      </FormSection>
    </>
  )
}
