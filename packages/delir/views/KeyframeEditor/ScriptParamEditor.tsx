import * as monaco from 'monaco-editor'
import * as React from 'react'

import MonacoUtil from '../../utils/Monaco'
import Button from '../components/Button'
import { EditorResult, TargetParam } from './KeyframeEditor'
import * as s from './ScriptParamEditor.styl'

interface Props {
    title: string
    code: string
    target: TargetParam
    onClose: (result: EditorResult) => void
}

export default class ScriptParamEditor extends React.Component<Props> {
    private editor: monaco.editor.IStandaloneCodeEditor
    private editorElement = React.createRef<HTMLDivElement>()

    public componentDidMount()
    {
        this.editor = monaco.editor.create(this.editorElement.current!, {
            language: 'javascript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: {enabled: false},
            value: this.props.code ? this.props.code : '',
        })

        this.editor.createContextKey('cond1', true)
        this.editor.createContextKey('cond2', true)
        this.editor.onDidFocusEditorText(this.handleFocusEditor)
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.handleClickWithSave, 'cond1')
    }

    public componentWillUnmount() {
        this.editor.dispose()
    }

    public render() {
        const {title} = this.props

        return (
            <div className={s.ScriptParamEditor}>
                <div className={s.toolbar}>
                    <span className={s.title}>Code: {title}</span>
                    <Button type='normal' onClick={this.handleClickCloseWithoutSave}>変更を破棄</Button>
                    <Button type='primary' onClick={this.handleClickWithSave}>保存</Button>
                </div>
                <div ref={this.editorElement} className={s.editor} />
            </div>
        )
    }

    private handleFocusEditor = () => {
        MonacoUtil.activateLibrarySet('scriptEditor')
    }

    private handleClickWithSave = () =>
    {
        this.props.onClose({
            saved: true,
            code: this.editor.getValue(),
            target: this.props.target
        })
    }

    private handleClickCloseWithoutSave = () =>
    {
        console.log('close')
        this.props.onClose({
            saved: false,
            code: null,
            target: this.props.target
        })
    }
}
