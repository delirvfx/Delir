import * as monaco from 'monaco-editor'
import * as React from 'react'

import MonacoUtil from '../../utils/Monaco'
import Button from '../components/Button'
import { TargetParam } from './KeyframeEditor'
import * as s from './ScriptParamEditor.styl'

interface Props {
    code: string
    target: TargetParam
}

export default class ScriptParamEditor extends React.Component<Props> {
    private _editor: monaco.editor.IStandaloneCodeEditor
    private editorElement = React.createRef<HTMLDivElement>()

    public componentDidMount()
    {
        this._editor = monaco.editor.create(this.editorElement.current!, {
            language: 'javascript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: {enabled: false},
            value: this.props.code ? this.props.code : '',
        })

        this._editor.createContextKey('cond1', true)
        this._editor.createContextKey('cond2', true)
        this._editor.onDidFocusEditorText(this.onFocusEditor)
        // this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.closeWithSave, 'cond1')
        // this._editor.addCommand(monaco.KeyCode.Escape, this.closeWithoutSave, 'cond2')
    }

    public render() {
        return (
            <div className={s.ScriptParamEditor}>
                <div className={s.toolbar}>
                    {/* <span className={s.title}>Expression: {title}</span> */}
                    <Button type='normal' onClick={this.closeWithoutSave}>変更を破棄</Button>
                    <Button type='primary' onClick={this.closeWithSave}>保存</Button>
                </div>
                <div ref={this.editorElement} className={s.editor} />
            </div>
        )
    }

    private onFocusEditor = () => {
        MonacoUtil.activateLibrarySet('scriptEditor')
    }

    private closeWithSave = () =>
    {
        this.props.onClose({
            saved: true,
            code: this._editor.getValue(),
            target: this.props.target
        })
    }

    private closeWithoutSave = () =>
    {
        this.props.onClose({
            saved: false,
            code: null,
            target: this.props.target
        })
    }
}
