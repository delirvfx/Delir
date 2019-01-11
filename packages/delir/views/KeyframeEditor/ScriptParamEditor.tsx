import * as monaco from 'monaco-editor'
import * as React from 'react'

import MonacoUtil from '../../utils/Monaco'

import Button from '../../components/Button'

import { ParameterTarget } from '../../domain/Editor/types'
import { EditorResult } from './KeyframeEditor'

import * as s from './ScriptParamEditor.styl'

interface Props {
    title: string
    code: string
    target: ParameterTarget
    onChange: (result: EditorResult) => void
    onClose: () => void
}

export default class ScriptParamEditor extends React.Component<Props> {
    private editor: monaco.editor.IStandaloneCodeEditor
    private editorElement = React.createRef<HTMLDivElement>()
    private disposables: monaco.IDisposable[] = []

    public componentDidMount() {
        this.editor = monaco.editor.create(this.editorElement.current!, {
            language: 'javascript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: { enabled: false },
            value: this.props.code ? this.props.code : '',
        })

        this.editor.createContextKey('cond1', true)
        this.editor.createContextKey('cond2', true)
        this.disposables.push(this.editor.onDidFocusEditorText(this.handleFocusEditor))
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.handleClose, 'cond1')
        this.disposables.push(this.editor.getModel().onDidChangeContent(this.handleChangeContent))
    }

    public componentWillUnmount() {
        this.disposables.forEach(d => d.dispose)
        this.editor.dispose()
    }

    public render() {
        const { title } = this.props

        return (
            <div className={s.ScriptParamEditor}>
                <div className={s.toolbar}>
                    <span className={s.title}>Code: {title}</span>
                    <Button type="normal" onClick={this.handleClose}>
                        閉じる
                    </Button>
                </div>
                <div ref={this.editorElement} className={s.editor} />
            </div>
        )
    }

    private handleFocusEditor = () => {
        MonacoUtil.activateLibrarySet('scriptEditor')
    }

    private handleChangeContent = () => {
        this.props.onChange({
            code: this.editor.getValue(),
            target: this.props.target,
        })
    }

    private handleClose = () => {
        this.props.onClose()
    }
}
