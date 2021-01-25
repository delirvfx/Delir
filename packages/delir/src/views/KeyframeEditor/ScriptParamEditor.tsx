import * as monaco from 'monaco-editor'
import React, { useCallback, useEffect, useRef } from 'react'

import MonacoUtil from '../../utils/Monaco'

import { Button } from '../../components/Button'

import { ParameterTarget } from '../../domain/Editor/types'
import { EditorResult } from './KeyframeEditor'

import t from './KeyframeEditor.i18n'
import s from './ScriptParamEditor.sass'

interface Props {
  title: string
  code: string
  langType: string
  target: ParameterTarget
  onClose: (result: EditorResult) => void
}

export const ScriptParamEditor = ({ title, code, langType, target, onClose }: Props) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const disposables = useRef<monaco.IDisposable[]>([])

  const handleClose = useCallback(() => {
    onClose({
      code: editorRef.current!.getValue(),
      target: target,
    })
  }, [target, onClose])

  useEffect(() => {
    const editor = monaco.editor.create(editorContainerRef.current!, {
      language: langType,
      codeLens: true,
      automaticLayout: true,
      theme: 'vs-dark',
      minimap: { enabled: false },
      value: code ? code : '',
    })

    editor.createContextKey('cond1', true)
    editor.createContextKey('cond2', true)
    disposables.current.push(
      editor.onDidFocusEditorText(() => {
        MonacoUtil.activateLibrarySet('scriptEditor')
      }),
    )
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleClose, 'cond1')
    editor.focus()

    editorRef.current = editor

    return () => {
      disposables.current.forEach(d => d.dispose())
      disposables.current = []
      editorRef.current!.dispose()
    }
  }, [target.entityId, target.paramName])

  useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.setValue(code)
  }, [code])

  return (
    <div className={s.ScriptParamEditor}>
      <div className={s.toolbar}>
        <span className={s.title}>Code: {title}</span>
        <Button kind="primary" onClick={handleClose}>
          {t(t.k.save)}
        </Button>
      </div>
      <div ref={editorContainerRef} className={s.editor} />
    </div>
  )
}
