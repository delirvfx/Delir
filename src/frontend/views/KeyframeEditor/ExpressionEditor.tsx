import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'

interface Props {
    className?: string
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
        className: PropTypes.string,
        show: PropTypes.bool.isRequired,
        code: PropTypes.string,
        onClose: PropTypes.func.isRequired
    }

    private _editor: monaco.editor.IStandaloneCodeEditor
    private editorElement: HTMLDivElement

    public componentDidMount()
    {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(Delir.Renderer.expressionContextTypeDefinition, 'ExpressionAPI.ts')

        this._editor = monaco.editor.create(this.editorElement, {
            language: 'typescript',
            codeLens: true,
            automaticLayout: true,
            theme: 'vs-dark',
            minimap: {enabled: false},
        })

        this._editor.createContextKey('cond1', true)
        this._editor.createContextKey('cond2', true)
        this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.closeEditorWithSave, 'cond1')
        this._editor.addCommand(monaco.KeyCode.Escape, this.closeEditorWithoutSave, 'cond2')
    }

    public componentWillUpdate(nextProps: Readonly<Props>, nextState: any)
    {
        this._editor.setValue(nextProps.code)
    }

    private bindEditorElement = (el: HTMLDivElement) =>
    {
        this.editorElement = el
    }

    private closeEditorWithSave = () =>
    {
        this.props.onClose({saved: true, code: this._editor.getValue()})
    }

    private closeEditorWithoutSave = () =>
    {
        this.props.onClose({saved: false, code: null})
    }

    public render()
    {
        const {className} = this.props

        return (
            <div ref={this.bindEditorElement} className={className} />
        )
    }
}

export default ExpressionEditor
