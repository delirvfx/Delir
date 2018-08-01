import * as React from 'react'

import Button from '../../views/components/Button'
import Link from '../../views/components/Link'
import ModalWindow from '../ModalWindow/Controller'

import packageJson from '../../../../package.json'
import corePackageJSON from '../../../delir-core/package.json'
import t from './AboutModal.i18n.ts'
import * as s from './AboutModal.styl'

export const show = (): void => {
    const modal = new ModalWindow({closable: true})

    const onClosed = async () => {
        await modal.hide()
        modal.dispose()
    }

    modal.mount(<AboutModal onClosed={onClosed} />)
    setTimeout(() => modal.show(), 1000)
}

const AboutModal = (props: {onClosed: () => void}) => {
    return (
        <div className={s.AboutModal}>
            <h1>Delir<small>{packageJson.version}</small></h1>
            <dl>
                <dt>Contact</dt>
                <dd><Link href='https://twitter.com/@DelirVFX'>Twitter: @DelirVFX</Link></dd>

                <dt>GitHub</dt>
                <dd><Link href='https://github.com/Ragg-/Delir'>https://github.com/Ragg-/Delir</Link></dd>

                <dt>Discord</dt>
                <dd><Link href='https://discord.gg/rrr2z2E'>DelirVFX</Link></dd>

                <dt>Runtime</dt>
                <dd>
                    Electron: {process.versions.electron} / Node.js: {process.versions.node}<br />
                    delir-core: {corePackageJSON.version}
                </dd>
            </dl>

            <Button type='normal' className={s.AboutModal_Closer} onClick={props.onClosed}>{t('close')}</Button>
        </div>
    )
}
