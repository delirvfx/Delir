import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'

import * as PreferenceOps from '../../domain/Preference/operations'
import PreferenceStore, { Preference as PreferenceJson } from '../../domain/Preference/PreferenceStore'

import Button from '../../views/components/Button'

import t from './Preference.i18n'
import * as s from './style.styl'

interface OwnProps {
    onClose(): void
}

interface ConnectedProps {
    preference: PreferenceJson
}

type Props = OwnProps & ConnectedProps & ContextProp

interface State {
    activePanel: 'renderer-general'
}

export default withComponentContext(connectToStores([PreferenceStore], (context) => ({
    preference: context.getStore(PreferenceStore).getPreferences(),
}))(class Preference extends React.Component<Props, State> {
    public state: State = {
        activePanel: 'renderer-general'
    }

    public componentDidMount() {
        window.addEventListener('keyup', this.handleWindowKeyup)
    }

    public componentWillUnmount() {
        window.removeEventListener('keyup', this.handleWindowKeyup)
    }

    public render()
    {
        const { activePanel } = this.state

        return (
            <div className={s.Preference}>
                <div className={s.sidebarRegion}>
                    <div className={s.sidebar}>
                        <div className={s.header}>{t('sidebar.renderer')}</div>
                        <div className={classnames(s.item, activePanel === 'renderer-general' && s.itemActive)}>{t('sidebar.rendererGeneral')}</div>
                    </div>
                </div>
                <div className={s.contentRegion}>
                    <div className={s.content}>
                        {activePanel === 'renderer-general' && this.renderRendererGeneralPane()}
                        <div className={s.contentFoot}>
                            <Button type='normal' onClick={this.props.onClose}>{t('close')}</Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    private renderRendererGeneralPane()
    {
        const { preference } = this.props

        return (
            <>
                <h2>{t('rendererGeneral.title')}</h2>
                <div className={s.checkboxCard}>
                    <label htmlFor='pref-rendererGeneral-ignoreMissingEffect'>{t('rendererGeneral.ignoreMissingEffect')}</label>
                    <input
                        id='pref-rendererGeneral-ignoreMissingEffect'
                        type='checkbox'
                        checked={preference.renderer.ignoreMissingEffect}
                        onChange={this.handleRendererIgnoreMissingEffect}
                    />
                    <small>{t('rendererGeneral.ignoreMissingEffectDesc')}</small>
                </div>
            </>
        )
    }

    private handleWindowKeyup = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.props.onClose()
        }
    }

    private handleRendererIgnoreMissingEffect = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
        this.props.context.executeOperation(PreferenceOps.setRendererIgnoreMissingEffectPreference, {
            ignore: currentTarget.checked,
        })
    }
}))
