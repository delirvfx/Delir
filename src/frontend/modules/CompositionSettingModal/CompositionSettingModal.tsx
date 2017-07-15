import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'
import * as serialize from 'form-serialize'

import　ModalWindow from '../../modules/ModalWindow/Controller'
import FormStyle from '../../views/components/Form'
import * as s from './CompositionSettingModal.styl'

type SettingResult = {[props: string]: string} | void

export const show = (props: {composition?: Delir.Project.Composition} = {}): Promise<SettingResult> => {
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
    composition?: Delir.Project.Composition,
    onConfirm: (opts: {[props: string]: string}) => void,
    onCancel: () => void
}

class CompositionSettingModal extends React.PureComponent<Props, any>
{
    public static propTypes = {
        composition: PropTypes.object,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    }

    private onConfirm = () =>
    {
        const opts = serialize((this.refs.form as HTMLFormElement), {hash: true})
        this.props.onConfirm(opts as {[p: string]: string})
    }

    private onCancel = () =>
    {
        this.props.onCancel()
    }

    public render()
    {
        const {composition: comp} = this.props

        const toRGBHash = ({r, g, b}: Delir.ColorRGB) => '#' + [r, g, b].map(c => c.toString(16)).join('')
        const values: {[prop: string]: any} = {
            name: comp ? comp.name : 'New Composition',
            width: comp ? comp.width : 1,
            height: comp ? comp.height : 1,
            backgroundColor: comp ? toRGBHash(comp.backgroundColor) : '#fff',
            framerate: comp ? comp.framerate : 30,
            durationSeconds: comp ? comp.durationFrames / comp.framerate : 10,
            samplingRate: comp ? comp.samplingRate : 48000,
            audioChannels: comp ? comp.audioChannels : 2,
        }

        return (
            <div className={s.newCompModalRoot}>
                <form ref='form' className={FormStyle.formHorizontal}>
                    <div className='formGroup'>
                        <label className="label">Composition name:</label>
                        <div className="input">
                            <div className='formControl'>
                                <input name="name" type="text" defaultValue={values.name} required autoFocus />
                            </div>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">width:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="width" type="number" min="1" defaultValue={values.width} required />
                            </div><span className="unit">px</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">height:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="height" type="number" min="1" defaultValue={values.height} required />
                            </div><span className="unit">px</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">background color:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="backgroundColor" type="color" defaultValue={values.backgroundColor} required />
                            </div><span className="unit">px</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">framerate:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="framerate" type="number" min="1" defaultValue={values.framerate} required />
                            </div><span className="unit">fps</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">duration(sec):</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="durationSeconds" type="number" min="1" defaultValue={values.durationSeconds} required />
                            </div><span className="unit">s</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">Sampling rate:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <select name="samplingRate" defaultValue={values.samplingRate} required>
                                    <option value="48000">48000</option>
                                    <option value="41000">41000</option>
                                </select>
                            </div><span className="unit">Hz</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">Channels:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <select name="audioChannels" defaultValue={values.audioChannels} required>
                                    <option value="2">Stereo (2ch)</option>
                                    <option value="1">Mono (1ch)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={s.modalFooter}>
                        <button id="cancel" className="button" type='button' onClick={this.onCancel}>キャンセル</button>
                        <button className="button primary" type='button' onClick={this.onConfirm}>{comp ? '適用' : '作成'}</button>
                    </div>
                </form>
            </div>
        )
    }
}
