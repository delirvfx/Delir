import * as Delir from '@ragg/delir-core'
import * as serialize from 'form-serialize'
import * as React from 'react'

import ModalWindow from '../../modules/ModalWindow/Controller'
import Button from '../../views/components/Button'
import FormStyle from '../../views/components/Form'

import t from './CompositionSettingModal.i18n'
import * as s from './CompositionSettingModal.styl'

type SettingResult = {[props: string]: string} | void

export const show = (props: {composition?: Delir.Entity.Composition} = {}): Promise<SettingResult> => {
    return new Promise((resolve) => {
        const resolver = async (result?: SettingResult) => {
            await modal.hide()
            modal.dispose()
            resolve(result)
        }

        const modal = new ModalWindow()

        modal.mount(
            <CompositionSettingModal
                composition={props.composition}
                onConfirm={resolver}
                onCancel={resolver}
            />
        )

        modal.show()
    })
}

interface Props {
    composition?: Delir.Entity.Composition,
    onConfirm: (opts: {[props: string]: string}) => void,
    onCancel: () => void
}

class CompositionSettingModal extends React.PureComponent<Props, any>
{
    private formRef = React.createRef<HTMLFormElement>()

    public render()
    {
        const {composition: comp} = this.props

        const toRGBHash = ({r, g, b}: Delir.Values.ColorRGB) => '#' + [r, g, b].map(c => c.toString(16)).join('')
        const values: {[prop: string]: any} = {
            name: comp ? comp.name : 'New Composition',
            width: comp ? comp.width : 640,
            height: comp ? comp.height : 360,
            backgroundColor: comp ? toRGBHash(comp.backgroundColor) : '#fff',
            framerate: comp ? comp.framerate : 30,
            durationSeconds: comp ? comp.durationFrames / comp.framerate : 10,
            samplingRate: comp ? comp.samplingRate : 48000,
            audioChannels: comp ? comp.audioChannels : 2,
        }

        return (
            <div className={s.newCompModalRoot}>
                <form ref={this.formRef} className={FormStyle.formHorizontal} onSubmit={this.handleSubmit}>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.compositionName')}:</label>
                        <div className='input'>
                            <div className='formControl'>
                                <input name='name' type='text' defaultValue={values.name} required autoFocus />
                            </div>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.dimensions')}:</label>
                        <div className='inputs'>
                            <div className='formControl'>
                                <input name='width' type='number' min='1' defaultValue={values.width} required style={{width: '6em'}} />
                            </div>
                            <span className='unit'> x </span>
                            <div className='formControl'>
                                <input name='height' type='number' min='1' defaultValue={values.height} required style={{width: '6em'}} />
                            </div>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.backgroundColor')}:</label>
                        <div className='inputs'>
                            <div className='formControl'>
                                <input name='backgroundColor' type='color' defaultValue={values.backgroundColor} style={{borderBottom: 'none', padding: 0, height: 24, width: 20, verticalAlign: 'middle'}} required />
                            </div>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.framerate')}:</label>
                        <div className='inputs'>
                            <div className='formControl'>
                                <input name='framerate' type='number' min='1' defaultValue={values.framerate} required style={{width: '6em'}} />
                            </div><span className='unit'>fps</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.durationSec')}:</label>
                        <div className='inputs'>
                            <div className='formControl'>
                                <input name='durationSeconds' type='number' min='1' defaultValue={values.durationSeconds} required style={{width: '6em'}} />
                            </div><span className='unit'>s</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.samplingRate')}:</label>
                        <div className='inputs'>
                            <div className='formControl'>
                                <select name='samplingRate' defaultValue={values.samplingRate} required>
                                    <option value='48000'>48000</option>
                                    <option value='41000'>41000</option>
                                </select>
                            </div><span className='unit'>Hz</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className='label'>{t('fields.audioChannels')}:</label>
                        <div className='inputs'>
                            <div className='formControl'>
                                <select name='audioChannels' defaultValue={values.audioChannels} required>
                                    <option value='2'>{t('values.audioChannels.stereo')}</option>
                                    <option value='1'>{t('values.audioChannels.mono')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={s.modalFooter}>
                        <Button type='normal' onClick={this.onCancel}>{t('cancel')}</Button>
                        <Button type='primary' onClick={this.onConfirm}>{comp ? t('apply') : t('create')}</Button>
                    </div>
                </form>
            </div>
        )
    }

    private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()

        this.onConfirm()
    }

    private onConfirm = () =>
    {
        const opts = serialize(this.formRef.current!, {hash: true})
        this.props.onConfirm(opts as {[p: string]: string})
    }

    private onCancel = (e: React.MouseEvent<HTMLButtonElement>) =>
    {
        e.preventDefault()
        this.props.onCancel()
    }
}
