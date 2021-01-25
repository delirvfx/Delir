import { useFleurContext, useStore } from '@fleur/react'
import classnames from 'classnames'
import React from 'react'

import { Button } from '../../components/Button'
import * as PreferenceOps from '../../domain/Preference/operations'
import PreferenceStore, { Preference as PreferenceJson } from '../../domain/Preference/PreferenceStore'
import { useEscKeyListener, useObjectState } from '../../utils/hooks'

import { getAllPreferences } from 'domain/Preference/selectors'
import { DevelopmentPlguinPane } from './Panes/Development/Plugin'
import t from './Preference.i18n'
import s from './Preference.sass'

interface Props {
  onClose(): void
}

interface ConnectedProps {
  preference: PreferenceJson
}

interface State {
  activePanel: 'renderer-general' | 'development-plugin'
}

const RendererGeneralPane = () => {
  const context = useFleurContext()

  const { preference } = useStore(getStore => ({
    preference: getAllPreferences(getStore),
  }))

  const handleRendererIgnoreMissingEffect = React.useCallback(
    ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
      context.executeOperation(PreferenceOps.setRendererIgnoreMissingEffectPreference, {
        ignore: currentTarget.checked,
      })
    },
    [],
  )

  return (
    <>
      <h2>{t(t.k.rendererGeneral.title)}</h2>
      <div className={s.checkboxCard}>
        <label htmlFor="pref-rendererGeneral-ignoreMissingEffect">{t(t.k.rendererGeneral.ignoreMissingEffect)}</label>
        <input
          id="pref-rendererGeneral-ignoreMissingEffect"
          type="checkbox"
          checked={preference.renderer.ignoreMissingEffect}
          onChange={handleRendererIgnoreMissingEffect}
        />
        <small>{t(t.k.rendererGeneral.ignoreMissingEffectDesc)}</small>
      </div>
    </>
  )
}
export const Preference = ({ onClose }: Props) => {
  const [{ activePanel }, update] = useObjectState<State>({
    activePanel: 'renderer-general',
  })

  useEscKeyListener(() => onClose(), [onClose])

  return (
    <div className={s.preference}>
      <div className={s.sidebarRegion}>
        <div className={s.sidebar}>
          <div className={s.header}>{t(t.k.sidebar.renderer)}</div>
          <div
            className={classnames(s.item, activePanel === 'renderer-general' && s.itemActive)}
            onClick={() => update({ activePanel: 'renderer-general' })}
          >
            {t(t.k.sidebar.rendererGeneral)}
          </div>

          <div className={s.header}>{t(t.k.sidebar.devel)}</div>
          <div
            className={classnames(s.item, activePanel === 'development-plugin' && s.itemActive)}
            onClick={() => update({ activePanel: 'development-plugin' })}
          >
            {t(t.k.sidebar.develPlugin)}
          </div>
        </div>
      </div>
      <div className={s.contentRegion}>
        <div className={s.content}>
          {activePanel === 'renderer-general' && <RendererGeneralPane />}
          {activePanel === 'development-plugin' && <DevelopmentPlguinPane />}
          <div className={s.contentFoot}>
            <Button kind="normal" onClick={onClose}>
              {t(t.k.close)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
