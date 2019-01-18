import * as React from 'react'

import * as monaco from 'monaco-editor'
import MonacoUtil from '../../utils/Monaco'

import Button from '../../components/Button'

import { ParameterTarget } from '../../domain/Editor/types'
import { EditorResult } from './KeyframeEditor'

import * as s from './ExpressionEditor.styl'
import t from './KeyframeEditor.i18n'

interface Props {
    title: string | null
    code: string | null
    target: ParameterTarget
    onClose: (result: EditorResult) => void
}

export default class ExpressionEditor extends React.Component<Props> {
    private editor: monaco.editor.IStandaloneCodeEditor
    private editorElement: HTMLDivElement
    private disposables: monaco.IDisposable[] = []

    public componentDidMount() {
        this.editor = monaco.editor.create(this.editorElement, {
            language: 'javascript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: { enabled: false },
            value: this.props.code ? this.props.code : '',
        })

        this.editor.createContextKey('cond1', true)
        this.editor.createContextKey('cond2', true)
        this.disposables.push(this.editor.onDidFocusEditorText(this.onFocusEditor))
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.handleClickClose, 'cond1')
        this.editor.focus()
    }

    public shouldComponentUpdate(nextProps: Props) {
        // Only update contents on target entity changed
        // (Guard from parent component controll to reset content)
        return (
            nextProps.target.entityId !== this.props.target.entityId ||
            nextProps.target.paramName !== this.props.target.paramName
        )
    }

    public componentDidUpdate() {
        this.editor.setValue(this.props.code ? this.props.code : '')
    }

    public render() {
        const { title } = this.props

        return (
            <div className={s.ExpressionEditor}>
                <div className={s.ExpressionEditor__Toolbar}>
                    <span className={s.ExpressionEditor__Title}>Expression: {title}</span>
                    <Button type="normal" onClick={this.handleClickClose}>
                        {t('save')}
                    </Button>
                </div>
                <div ref={this.bindEditorElement} className={s.ExpressionEditor__Editor} />
            </div>
        )
    }

    private bindEditorElement = (el: HTMLDivElement) => {
        this.editorElement = el
    }

    private onFocusEditor = () => {
        MonacoUtil.activateLibrarySet('expressionEditor')
    }

    private handleClickClose = () => {
        this.props.onClose({
            code: this.editor.getValue(),
            target: this.props.target,
        })
    }
}
