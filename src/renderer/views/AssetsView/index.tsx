import * as _ from 'lodash'
import * as React from 'react'
import { PropTypes } from 'react'
import parseColor from 'parse-color'
import serialize from 'form-serialize'
import { ProjectHelper, ColorRGB } from 'delir-core'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import { default as EditorStateStore, EditorState } from '../../stores/editor-state-store'
import { default as ProjectModifyStore, ProjectModifyState } from '../../stores/project-modify-store'

import Portal from '../../utils/portal'
import Pane from '../components/pane'
import LabelInput from '../components/label-input'
import { Table, TableHeader, TableBodySelectList, Row, Col } from '../components/table'
import { ContextMenu, MenuItem } from '../electron/context-menu'

import * as Modal from '../electron/modal-window'
import FormStyle from '../components/Form'
import NewCompositionWindow from '../modal-windows/new-composition-window'
import SettingCompositionWindow from '../modal-windows/setting-composition-window'

import connectToStores from '../../utils/connectToStores'

import * as s from './style.styl'

export interface AssetsViewProps {
    editor: EditorState,
}

export interface AssetsViewState {
    newCompositionWindowOpened: boolean,
    settingCompositionWindowOpened: boolean,
    settingCompositionQuery: {[name: string]: string|number} | null,
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

    addAsset = e => {
        _.each(e.dataTransfer.files, (file, idx) => {
            if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

            ProjectModifyActions.addAsset({
                name: file.name,
                mimeType: file.type,
                path: file.path,
            })
        })
    }

    changeComposition = (compId, e) => {
        EditorStateActions.changeActiveComposition(compId)
    }

    modifyCompName = (compId, newName) => {
        ProjectModifyActions.modifyComposition(compId, { name: newName })
    }

    openCompositionSettingWindow = compId => {
        const { project } = this.props.app
        if (project == null) return

        const targetComposition = ProjectHelper.findCompositionById(project, compId)
        if (targetComposition == null) return

        this.setState({
            settingCompositionQuery: {
                id: targetComposition.id!,
                name: targetComposition.name!,
                width: targetComposition.width!,
                height: targetComposition.height!,
                framerate: targetComposition.framerate!,
                durationFrames: targetComposition.durationFrames!,
                samplingRate: targetComposition.samplingRate!,
                audioChannels: targetComposition.audioChannels!,
            },
            settingCompositionWindowOpened: true,
        })
    }

    settingComoisition = (req: {
        id:string,
        name: string,
        width: string,
        height: string,
        framerate: string,
        durationSeconds: string
    }) => {
        this.setState({
            settingCompositionQuery: null,
            settingCompositionWindowOpened: false,
        })

        ProjectModifyActions.modifyComposition(req.id, req)
    }

    openNewCompositionWindow =  async () =>
    {
        type CreateRequest = {
            name: string,
            width: string,
            height: string,
            framerate: string,
            durationSeconds: string,
            backgroundColor: string
        }

        let modal = Modal.create()
        const req = (await new Promise<{[p: string]: string}|void>(resolve => {
            modal.mount(<NewCompositionModal onConfirm={resolve} onCancel={resolve} />)
            modal.show()
        })) as CreateRequest|void

        modal.dispose()

        if (!req) {
            return
        }

        const bgColor = parseColor(req.backgroundColor)

        ProjectModifyActions.createComposition({
            name: req.name,
            width: +req.width,
            height: +req.height,
            framerate: +req.framerate,
            durationFrames: +req.framerate * parseInt(req.durationSeconds, 10),
            backgroundColor: new ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2]),
        })
    }

    onAssetsDragStart = ({target}: {target: HTMLElement}) => {
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
            <Pane className='view-assets' allowFocus>
                <SettingCompositionWindow
                    show={this.state.settingCompositionWindowOpened}
                    width={400}
                    height={350}
                    query={this.state.settingCompositionQuery!}
                    onHide={this.makeNewComposition}
                    onResponse={this.settingComoisition}
                />
                <Table className='asset-list' onDrop={this.addAsset}>
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
                                    <MenuItem label='Reload' onClick={() => {}} />
                                    <MenuItem label='Remove it' onClick={() => {}}/>
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
                <Table className='composition-list'>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'>⛰</Col>
                            <Col defaultWidth='10rem'>名前</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList onSelectionChanged={() => {}}>
                        <ContextMenu>
                            <MenuItem type='separator' />
                            <MenuItem label='New Compositon' onClick={() => { this.setState({newCompositionWindowOpened: true}) }} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <Row key={comp.id} onDoubleClick={this.changeComposition.bind(this, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`comp_name_input#${comp.id}`].enableAndFocus()}} />
                                    <MenuItem label='Remove it' onClick={() => {}}/>
                                    <MenuItem label='Composition setting' onClick={this.openCompositionSettingWindow.bind(null, comp.id)}/>
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
            </Pane>
        )
    }
}


class NewCompositionModal extends React.PureComponent<{
    onConfirm: (opts: {[props: string]: string}) => void,
    onCancel: () => void
}, any> {
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
        return (
            <div className={s.newCompModalRoot}>
                <form ref='form' className={FormStyle.formHorizontal}>
                    <div className='formGroup'>
                        <label className="label">Composition name:</label>
                        <div className="input">
                            <div className='formControl'>
                                <input name="name" type="text" value="New Composition" required="required" autofocus="autofocus" />
                            </div>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">width:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="width" type="number" min="1" required="required" />
                            </div><span className="unit">px</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">height:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="height" type="number" min="1" required="required" />
                            </div><span className="unit">px</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">background color:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="backgroundColor" type="color" required="required" />
                            </div><span className="unit">px</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">framerate:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="framerate" type="number" min="1" value="30" required="required" />
                            </div><span className="unit">fps</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">duration(sec):</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <input name="samplingRate" type="number" min="1" value="30" required="required" />
                            </div><span className="unit">s</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">Sampling rate:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <select name="samplingRate" required="required">
                                    <option value="48000" selected="selected">48000</option>
                                    <option value="41000">41000</option>
                                </select>
                            </div><span className="unit">Hz</span>
                        </div>
                    </div>
                    <div className='formGroup'>
                        <label className="label">Channels:</label>
                        <div className="inputs">
                            <div className='formControl'>
                                <select name="audioChannels" required="required">
                                    <option value="2" selected="selected">Stereo (2ch)</option>
                                    <option value="1">Mono (1ch)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={s.modalFooter}>
                        <button id="cancel" className="button" type='button' onClick={this.onCancel}>Cancel</button>
                        <button className="button primary" type='button' onClick={this.onConfirm}>Create</button>
                    </div>
                </form>
            </div>
        )
    }
}
