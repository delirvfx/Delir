import React, { useCallback, useEffect, useRef } from 'react'
import { ChangeEvent } from 'react'
import { animated } from 'react-spring'
import { useImmer } from 'use-immer'
import { ModalContent } from '../..//components/ModalContent/ModalContent'
import { Button } from '../../components/Button/Button'
import { FormSection } from '../../components/FormSection/FormSection'
import { Input } from '../../components/Input/Input'
import { useMountTransition, useValidation } from '../../utils/hooks'
import t from './ImportPackModal.i18n'
import s from './ImportPackModal.sass'

export type ImportPackResponse =
  | { cancelled: true }
  | {
      cancelled: false
      src: string
      dist: string
    }

export const ImportPackModal = ({ onClose }: { onClose: (result: ImportPackResponse) => void }) => {
  const [state, update] = useImmer<{ src: string | null; dist: string | null }>({ src: null, dist: null })
  const { style } = useMountTransition({
    config: { duration: 5000 },
    from: { trasform: 'translateY(-100%)' },
    enter: { transform: 'translateY(0%)' },
  })

  const distInputRef = useRef<HTMLInputElement | null>(null)
  const { errors, isValid } = useValidation(
    errors => {
      errors.src = state.src == null ? t(t.k.errors.requireImportFile) : null
      errors.dist = state.dist == null ? t(t.k.errors.requireExportDir) : null
    },
    [state],
  )

  useEffect(() => {
    distInputRef.current!.setAttribute('webkitDirectory', '')
  }, [])

  const handleImportFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const [{ path }] = e.currentTarget.files!
    update(draft => {
      draft.src = path
    })
  }, [])

  const handleDistDirChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const [{ path }] = e.currentTarget.files!
    update(draft => {
      draft.dist = path
    })
  }, [])

  const handleClickCancel = useCallback(() => {
    onClose({ cancelled: true })
  }, [])

  const handleClickSubmit = useCallback(() => {
    if (!isValid()) return
    onClose({ cancelled: false, src: state.src!, dist: state.dist! })
  }, [isValid])

  return (
    <animated.div className={s.root} style={style}>
      <ModalContent
        footer={
          <>
            <Button kind="normal" onClick={handleClickCancel}>
              {t(t.k.buttons.cancel)}
            </Button>
            <Button kind="primary" onClick={handleClickSubmit}>
              {t(t.k.buttons.continue)}
            </Button>
          </>
        }
      >
        <h1>{t(t.k.title)}</h1>

        <FormSection label={`${t(t.k.importing)} *`} error={errors.src}>
          <Input type="file" blocked accept=".delirpp" onChange={handleImportFileChange} />
        </FormSection>

        <FormSection label={`${t(t.k.extracting)} *`} error={errors.dist}>
          <Input ref={distInputRef} type="file" blocked onChange={handleDistDirChange} />
        </FormSection>
      </ModalContent>
    </animated.div>
  )
}
