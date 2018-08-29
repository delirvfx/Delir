import * as Delir from '@ragg/delir-core'
import * as React from 'react'

import * as monaco from 'monaco-editor'
import MonacoUtil from '../../utils/Monaco'

import Button from '../components/Button'

import * as s from './ExpressionEditor.styl'

interface Props {
    title: string | null
    entityId: string | null
    code: string | null
    onClose: (result: ExpressionEditor.EditorResult) => void
}

// tslint:disable-next-line no-namespace
namespace ExpressionEditor {
    export type EditorResult = {
        /** if save cancelled then it value to be false */
        saved: true
        code: string
    } | {
        saved: false
        code: null
    }
}

export default class ExpressionEditor extends React.Component<Props> {
    private _editor: monaco.editor.IStandaloneCodeEditor
    private editorElement: HTMLDivElement

    public componentDidMount()
    {
        this._editor = monaco.editor.create(this.editorElement, {
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
        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.closeWithSave, 'cond1')
        // this._editor.addCommand(monaco.KeyCode.Escape, this.closeWithoutSave, 'cond2')
    }

    public shouldComponentUpdate(nextProps: Props, nextState: {})
    {
        // Only update contents on target entity changed
        // (Guard from parent component controll to reset content)
        return nextProps.entityId !== this.props.entityId
    }

    public componentDidUpdate()
    {
        this._editor.setValue(this.props.code ? this.props.code : '')
    }

    public render()
    {
        const {title} = this.props

        return (
            <div className={s.ExpressionEditor}>
                <div className={s.ExpressionEditor__Toolbar}>
                    <span className={s.ExpressionEditor__Title}>Expression: {title}</span>
                    <Button type='normal' onClick={this.closeWithoutSave}>変更を破棄</Button>
                    <Button type='primary' onClick={this.closeWithSave}>保存</Button>
                </div>
                <div ref={this.bindEditorElement} className={s.ExpressionEditor__Editor} />
            </div>
        )
    }

    private bindEditorElement = (el: HTMLDivElement) =>
    {
        this.editorElement = el
    }

    private onFocusEditor = () => {
        MonacoUtil.activateLibrarySet('expressionEditor')
    }

    private closeWithSave = () =>
    {
        this.props.onClose({saved: true, code: this._editor.getValue()})
    }

    private closeWithoutSave = () =>
    {
        this.props.onClose({saved: false, code: null})
    }
}
