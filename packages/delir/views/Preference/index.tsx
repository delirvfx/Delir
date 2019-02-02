import { useComponentContext, useStore } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'

import * as PreferenceOps from '../../domain/Preference/operations'
import PreferenceStore, { Preference as PreferenceJson } from '../../domain/Preference/PreferenceStore'

import Button from '../../components/Button'

import t from './Preference.i18n'
import * as s from './style.styl'

interface Props {
    onClose(): void
}

interface ConnectedProps {
    preference: PreferenceJson
}

interface State {
    activePanel: 'renderer-general'
}

const RendererGeneralPane = () => {
    const context = useComponentContext()

    const { preference } = useStore([PreferenceStore], getStore => ({
        preference: getStore(PreferenceStore).getPreferences(),
    }))

    const handleRendererIgnoreMissingEffect = React.useCallback(({
        currentTarget,
    }: React.ChangeEvent<HTMLInputElement>) => {
        context.executeOperation(PreferenceOps.setRendererIgnoreMissingEffectPreference, {
            ignore: currentTarget.checked,
        })
    }, [])

    return (
        <>
            <h2>{t(t.k.rendererGeneral.title)}</h2>
            <div className={s.checkboxCard}>
                <label htmlFor="pref-rendererGeneral-ignoreMissingEffect">
                    {t(t.k.rendererGeneral.ignoreMissingEffect)}
                </label>
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

export const Preference = (props: Props) => {
    const [{ activePanel }] = React.useState({
        activePanel: 'renderer-general',
    })

    const handleWindowKeyup = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            props.onClose()
        }
    }

    React.useEffect(() => {
        window.addEventListener('keyup', handleWindowKeyup)
        return () => window.removeEventListener('keyup', handleWindowKeyup)
    })

    return (
        <div className={s.Preference}>
            <div className={s.sidebarRegion}>
                <div className={s.sidebar}>
                    <div className={s.header}>{t(t.k.sidebar.renderer)}</div>
                    <div className={classnames(s.item, activePanel === 'renderer-general' && s.itemActive)}>
                        {t(t.k.sidebar.rendererGeneral)}
                    </div>
                </div>
            </div>
            <div className={s.contentRegion}>
                <div className={s.content}>
                    {activePanel === 'renderer-general' && <RendererGeneralPane />}
                    <div className={s.contentFoot}>
                        <Button type="normal" onClick={props.onClose}>
                            {t(t.k.close)}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
