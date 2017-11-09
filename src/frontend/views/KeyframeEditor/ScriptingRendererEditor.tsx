import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'

import Monaco from '../../utils/Monaco'

import Button from '../components/Button'

import * as s from './ExpressionEditor.styl'

interface Props {
    title: string| null
    entityId: string | null
    code: string|null
    onClose: (result: ExpressionEditor.EditorResult) => void
}

// tslint:disable-next-line no-namespace
namespace ExpressionEditor {
    export type EditorResult = {
        /** if save cancelled then it value to be false */
        saved: true
        code: string
    }|{
        saved: false
        code: null
    }
}

class ExpressionEditor extends React.Component<Props> {
    public static propTypes = {
        title: PropTypes.string.isRequired,
        entityId: PropTypes.string.isRequired,
        code: PropTypes.string,
        onClose: PropTypes.func.isRequired
    }

    private _editor: monaco.editor.IStandaloneCodeEditor
    private editorElement: HTMLDivElement

    public componentDidMount()
    {
        Monaco.registerLibrarySet('expression', [])

        this._editor = monaco.editor.create(this.editorElement, {
            language: 'java',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: {enabled: false},
            value: this.props.code ? this.props.code : '',
        })

        this._editor.createContextKey('cond1', true)
        this._editor.createContextKey('cond2', true)
        this._editor.onDidFocusEditor(this.onFocusEditor)
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

    private bindEditorElement = (el: HTMLDivElement) =>
    {
        this.editorElement = el
    }

    private onFocusEditor = () => {
        Monaco.activateLibrarySet('expression')
    }

    private closeWithSave = () =>
    {
        console.log({saved: true, code: this._editor.getValue()})
        this.props.onClose({saved: true, code: this._editor.getValue()})
    }

    private closeWithoutSave = () =>
    {
        this.props.onClose({saved: false, code: null})
    }

    public render()
    {
        const {title} = this.props

        return (
            <div className={s.ExpressionEditor}>
                <div className={s.ExpressionEditor__Toolbar}>
                    <span className={s.ExpressionEditor__Title}>Scripting renderer: {title}</span>
                    <Button type='normal' onClick={this.closeWithoutSave}>変更を破棄</Button>
                    <Button type='primary' onClick={this.closeWithSave}>保存</Button>
                </div>
                <div ref={this.bindEditorElement} className={s.ExpressionEditor__Editor} />
            </div>
        )
    }
}

export default ExpressionEditor
