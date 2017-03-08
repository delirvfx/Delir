import * as _ from 'lodash'
import * as React from 'react'
import { PropTypes } from 'react'
import * as parseColor from 'parse-color'
import * as serialize from 'form-serialize'

import * as Delir from 'delir-core'
import {ProjectHelper, ColorRGB} from 'delir-core'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import { default as EditorStateStore, EditorState } from '../../stores/editor-state-store'
import { default as ProjectModifyStore } from '../../stores/project-modify-store'

import Pane from '../components/pane'
import LabelInput from '../components/label-input'
import { Table, TableHeader, TableBodySelectList, Row, Col } from '../components/table'
import { ContextMenu, MenuItem } from '../components/context-menu'

import * as Modal from '../components/modal-window'
import FormStyle from '../components/Form'

import connectToStores from '../../utils/connectToStores'

import * as s from './style.styl'

export interface AssetsViewProps {
    editor: EditorState,
}

export interface AssetsViewState {
    newCompositionWindowOpened: boolean,
    settingCompositionWindowOpened: boolean,
    settingCompositionQuery: { [name: string]: string | number } | null,
}

type CompositionProps = {
    name: string,
    width: string,
    height: string,
    framerate: string,
    durationSeconds: string,
    backgroundColor: string,
    samplingRate: string,
    audioChannels: string,
}

const castToCompositionPropTypes = (req: CompositionProps) => {
    const bgColor = parseColor(req.backgroundColor)

    return {
        name: req.name,
        width: +req.width,
        height: +req.height,
        framerate: +req.framerate,
        durationFrames: +req.framerate * parseInt(req.durationSeconds, 10),
        backgroundColor: new ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2]),
        samplingRate: +req.samplingRate,
        audioChannels: +req.audioChannels,
    }
}

@connectToStores([EditorStateStore, ProjectModifyStore], (context, props) => ({
    editor: EditorStateStore.getState(),
}))
export default class AssetsView extends React.Component<AssetsViewProps, AssetsViewState>
{
    static propTypes = {
        editor: PropTypes.object.isRequired,
    }

    constructor()
    {
        super()

        this.state = {
            newCompositionWindowOpened: false,
            settingCompositionWindowOpened: false,
            settingCompositionQuery: null,
        }
    }

    addAsset = (e: React.DragEvent<HTMLDivElement>) =>
    {
        _.each(e.dataTransfer.files, (file, idx) => {
            if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

            ProjectModifyActions.addAsset({
                name: file.name,
                mimeType: file.type,
                path: file.path,
            })
        })
    }

    removeAsset = (assetId: string) =>
    {
        // TODO: Check references
        ProjectModifyActions.removeAsset(assetId)
    }

    changeComposition = (compId: string) =>
    {
        EditorStateActions.changeActiveComposition(compId)
    }

    removeComposition = (compId: string) =>
    {
        ProjectModifyActions.removeComposition(compId)
    }

    modifyCompName = (compId, newName) =>
    {
        ProjectModifyActions.modifyComposition(compId, { name: newName })
    }

    openCompositionSetting = async (compId: string) =>
    {
        if (!this.props.editor.project) return

        const comp = ProjectHelper.findCompositionById(this.props.editor.project, compId)!

        const modal = Modal.create()
        const req = (await new Promise<{[p: string]: string}|void>(resolve => {
            modal.mount(<NewCompositionModal composition={comp} onConfirm={resolve} onCancel={resolve} />)
            modal.show()
        })) as CompositionProps|void

        modal.dispose()

        if (!req) {
            return
        }

        ProjectModifyActions.modifyComposition(compId, castToCompositionPropTypes(req))
    }

    openNewCompositionWindow =  async () =>
    {
        const modal = Modal.create()
        const req = (await new Promise<{[p: string]: string}|void>(resolve => {
            modal.mount(<NewCompositionModal onConfirm={resolve} onCancel={resolve} />)
            modal.show()
        })) as CompositionProps|void

        modal.dispose()

        if (!req) {
            return
        }

        ProjectModifyActions.createComposition(castToCompositionPropTypes(req))
    }

    onAssetsDragStart = ({target}: {target: HTMLElement}) =>
    {
        const {editor: {project}} = this.props
        if (!project) return

        EditorStateActions.setDragEntity({
            type: 'asset',
            asset: ProjectHelper.findAssetById(project, target.dataset.assetId)!,
        })
    }

    onAssetDragEnd = () => {
        EditorStateActions.clearDragEntity()
    }

    render()
    {
        const {editor: {project}} = this.props
        const assets = project ? Array.from(project.assets.values()) : []
        const compositions = project ? Array.from(project.compositions.values()) : []

        return (
            <Pane className={s.assetsView} allowFocus>
                <Table className={s.compositionList}>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'>⛰</Col>
                            <Col defaultWidth='10rem'>名前</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList onSelectionChanged={() => {}}>
                        <ContextMenu>
                            <MenuItem type='separator' />
                            <MenuItem label='New Compositon' onClick={this.openNewCompositionWindow} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <Row key={comp.id} onDoubleClick={this.changeComposition.bind(null, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => this.refs[`comp_name_input#${comp.id}`].enableAndFocus()} />
                                    <MenuItem label='Remove' onClick={this.removeComposition.bind(null, comp.id)} />
                                    <MenuItem label='Composition setting' onClick={this.openCompositionSetting.bind(null, comp.id)} />
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <Col>🎬</Col>
                                <Col>
                                    <LabelInput
                                        ref={`comp_name_input#${comp.id}`}
                                        defaultValue={comp.name}
                                        placeholder='Unnamed Coposition'
                                        onChange={this.modifyCompName.bind(this, comp.id)}
                                    />
                                </Col>
                            </Row>
                        ))}
                    </TableBodySelectList>
                </Table>
                <Table className={s.assetList} onDrop={this.addAsset}>
                    <TableHeader>
                        <Row>
                            {/* <Col resizable={false} defaultWidth='2rem'></Col> */}
                            <Col defaultWidth='10rem'>名前</Col>
                            <Col defaultWidth='5rem'>種類</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList>
                        {assets.map(asset => (
                            <Row key={asset.id} data-asset-id={asset.id} draggable onDragStart={this.onAssetsDragStart} onDragEnd={this.onAssetDragEnd}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`asset_name_input#${asset.id}`].enableAndFocus()}} />
                                    {/*<MenuItem label='Reload' onClick={() => {}} />*/}
                                    <MenuItem label='Remove' onClick={this.removeAsset.bind(null, asset.id!)}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                {/*<Col></Col>*/}
                                <Col>
                                    <LabelInput
                                        ref={`asset_name_input#${asset.id}`}
                                        defaultValue={asset.name}
                                        placeholder='Unnamed Asset'
                                    />
                                </Col>
                                <Col>{asset.mimeType}</Col>
                            </Row>
                        ))}
                    </TableBodySelectList>
                </Table>
            </Pane>
        )
    }
}


class NewCompositionModal extends React.PureComponent<{
    composition?: Delir.Project.Composition,
    onConfirm: (opts: {[props: string]: string}) => void,
    onCancel: () => void
}, any>
{
    static propTypes = {
        composition: PropTypes.object,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    }

    onConfirm = () =>
    {
        const opts = serialize((this.refs.form as HTMLFormElement), {hash: true})
        console.log(opts)
        this.props.onConfirm(opts as {[p: string]: string})
    }

    onCancel = () =>
    {
        this.props.onCancel()
    }

    render()
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
                                <input name="durationSeconds" type="number" min="1" value="30" defaultValue={values.durationSeconds} required />
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
