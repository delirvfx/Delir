import React, { useCallback, useEffect, useRef } from 'react'

import * as monaco from 'monaco-editor'
import MonacoUtil from '../../utils/Monaco'

import { Button } from '../../components/Button'

import { ParameterTarget } from '../../domain/Editor/types'
import { EditorResult } from './KeyframeEditor'

import { useChangedEffect } from '@hanakla/arma'
import s from './ExpressionEditor.sass'
import t from './KeyframeEditor.i18n'

interface Props {
  title: string | null
  code: string | null
  target: ParameterTarget
  onClose: (result: EditorResult) => void
}

export default function ExpressionEditor({ code, onClose, target, title }: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const editorElementRef = useRef<HTMLDivElement | null>(null)
  const disposables = useRef<monaco.IDisposable[]>([])

  const onFocusEditor = useCallback(() => {
    MonacoUtil.activateLibrarySet('expressionEditor')
  }, [])

  const handleClickClose = useCallback(() => {
    onClose({
      code: editorRef.current!.getValue(),
      target,
    })
  }, [target])

  useEffect(() => {
    const editor = (editorRef.current = monaco.editor.create(editorElementRef.current!, {
      language: 'javascript',
      codeLens: true,
      automaticLayout: true,
      theme: 'vs-dark',
      minimap: { enabled: false },
      value: code ?? '',
    }))

    editor.createContextKey('cond1', true)
    editor.createContextKey('cond2', true)
    disposables.current.push(editor.onDidFocusEditorText(onFocusEditor))
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleClickClose, 'cond1')
    editor.focus()

    return () => {
      disposables.current.forEach((d) => d.dispose())
    }
  }, [])

  useChangedEffect(() => {
    editorRef.current!.setValue(code ?? '')
  }, [code])

  return (
    <div className={s.ExpressionEditor}>
      <div className={s.ExpressionEditor__Toolbar}>
        <span className={s.ExpressionEditor__Title}>Expression: {title}</span>
        <Button kind="primary" onClick={handleClickClose}>
          {t(t.k.save)}
        </Button>
      </div>
      <div ref={editorElementRef} className={s.ExpressionEditor__Editor} />
    </div>
  )
}
