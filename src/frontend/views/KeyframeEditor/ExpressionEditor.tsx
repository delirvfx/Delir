import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'

import Monaco from '../../utils/Monaco'

import Button from '../components/Button'

import * as s from './ExpressionEditor.styl'

const expressionAPITypeDef = {
    name: 'ExpressionAPI.d.ts',
    typedef: Delir.Engine.expressionContextTypeDefinition,
}

interface Props {
    title: string| null
    code: string|null
    onClose: (result: ExpressionEditor.EditorResult) => void
}

// tslint:disable-next-line no-namespace
namespace ExpressionEditor {
    export interface EditorResult {
        /** if save cancelled then it value to be false */
        saved: boolean
        code: string|null
    }
}

class ExpressionEditor extends React.Component<Props, null> {
    public static propTypes = {
        title: PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
        code: PropTypes.string,
        onClose: PropTypes.func.isRequired
    }

    private _editor: monaco.editor.IStandaloneCodeEditor
    private editorElement: HTMLDivElement

    public componentDidMount()
    {
        Monaco.registerLibrarySet('expression', [
            'lib.es5.d.ts',
            'lib.es2015.collection.d.ts',
            'lib.es2015.core.d.ts',
            'lib.es2015.generator.d.ts',
            'lib.es2015.iterable.d.ts',
            'lib.es2015.promise.d.ts',
            'lib.es2015.proxy.d.ts',
            'lib.es2015.reflect.d.ts',
            'lib.es2015.symbol.d.ts',
            'lib.es2015.symbol.wellknown.d.ts',
            'lib.es2016.array.include.d.ts',
            'console.d.ts',
            expressionAPITypeDef,
        ])

        this._editor = monaco.editor.create(this.editorElement, {
            language: 'javascript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: {enabled: false},
        })

        this._editor.createContextKey('cond1', true)
        this._editor.createContextKey('cond2', true)
        this._editor.onDidFocusEditor(this.onFocusEditor)
        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.closeWithSave, 'cond1')
        // this._editor.addCommand(monaco.KeyCode.Escape, this.closeWithoutSave, 'cond2')
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
                    <span className={s.ExpressionEditor__Title}>Expression: {title}</span>
                    <Button type='normal' onClick={this.closeWithoutSave}>変更を破棄</Button>
                    <Button type='primary' onClick={this.closeWithSave}>保存</Button>
                </div>
                <div ref={this.bindEditorElement} className={s.ExpressionEditor__Editor} />
            </div>
        )
    }
}

export default ExpressionEditor
