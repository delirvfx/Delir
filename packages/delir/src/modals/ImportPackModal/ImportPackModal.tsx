import React, { useCallback, useEffect, useRef } from 'react'
import { ChangeEvent } from 'react'
import { animated } from 'react-spring'
import { useImmer } from 'use-immer'
import { ModalContent } from '../..//components/ModalContent/ModalContent'
import { Button } from '../../components/Button/Button'
import { FormSection } from '../../components/FormSection/FormSection'
import { Input } from '../../components/Input/Input'
import { useMountTransition } from '../../utils/hooks'
import s from './ImportPackModal.sass'

export type ImportPackResponse =
  | { cancelled: true }
  | {
      cancelled: false
      src: string
      dist: string
    }

export const ImportPackModal = ({ onClose }: { onClose: (result: ImportPackResponse) => void }) => {
  const [state, update] = useImmer({ src: null, dist: null })
  const { style } = useMountTransition({
    config: { duration: 5000 },
    from: { trasform: 'translateY(-100%)' },
    enter: { transform: 'translateY(0%)' },
  })

  const distInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    distInputRef.current!.setAttribute('webkitDirectory', '')
  }, [])

  const handleImportFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const [{ path }] = e.currentTarget.files
  }, [])

  const handleDistDirChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const [{ path }] = e.currentTarget.files
  }, [])

  const handleClickCancel = useCallback(() => {
    onClose({ cancelled: true })
  }, [])

  return (
    <animated.div className={s.root} style={style}>
      <ModalContent
        footer={
          <>
            <Button type="normal" onClick={handleClickCancel}>
              Cancel
            </Button>
            <Button type="primary">Continue</Button>
          </>
        }
      >
        <h1>Import project from .delirpp</h1>

        <FormSection label={'Importing project pack (.delirpp)'}>
          <Input type="file" blocked accept=".delirpp" onChange={handleImportFileChange} />
        </FormSection>

        <FormSection label={'Extract directory'}>
          <Input ref={distInputRef} type="file" blocked onChange={handleDistDirChange} />
        </FormSection>
      </ModalContent>
    </animated.div>
  )
}
