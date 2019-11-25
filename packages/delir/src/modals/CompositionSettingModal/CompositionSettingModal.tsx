import * as Delir from '@delirvfx/core'
import serialize from 'form-serialize'
import parseColor from 'parse-color'
import React, { FormEvent, useCallback, useRef } from 'react'

import { Button } from 'components/Button'
import FormStyle from 'components/Form'
import { SpreadType } from 'utils/Spread'

import { ModalContent } from 'components/ModalContent/ModalContent'
import styled from 'styled-components'
import t from './CompositionSettingModal.i18n'

interface FormResult {
  name: string
  width: string
  height: string
  framerate: string
  durationSeconds: string
  backgroundColor: string
  samplingRate: string
  audioChannels: string
}

const castToCompositionPatch = (req: FormResult): CompositionSettingResult => {
  const bgColor = parseColor(req.backgroundColor)

  return {
    name: req.name,
    width: +req.width,
    height: +req.height,
    framerate: +req.framerate,
    durationFrames: +req.framerate * parseInt(req.durationSeconds, 10),
    backgroundColor: new Delir.Values.ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2]),
    samplingRate: +req.samplingRate,
    audioChannels: +req.audioChannels,
  }
}

interface Props {
  composition?: Delir.Entity.Composition
  onClose: (opts: CompositionSettingResult | false) => void
}

export type CompositionSettingResult = Partial<SpreadType<Delir.Entity.Composition>>

const Container = styled(ModalContent)`
  max-width: 500px;

  .label) {
    width: 10rem;
  }
`

export const CompositionSettingModal = ({ composition: comp, onClose }: Props) => {
  const formRef = useRef<HTMLFormElement | null>(null)

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLButtonElement>) => {
      const opts = (serialize(formRef.current!, { hash: true }) as unknown) as FormResult
      onClose(castToCompositionPatch(opts))
    },
    [onClose],
  )

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      onClose(false)
    },
    [onClose],
  )

  const toRGBHash = ({ r, g, b }: Delir.Values.ColorRGB) => '#' + [r, g, b].map(c => c.toString(16)).join('')
  const values: { [prop: string]: any } = {
    name: comp ? comp.name : 'New Composition',
    width: comp ? comp.width : 640,
    height: comp ? comp.height : 360,
    backgroundColor: comp ? toRGBHash(comp.backgroundColor) : '#fff',
    framerate: comp ? comp.framerate : 30,
    durationSeconds: comp ? comp.durationFrames / comp.framerate : 10,
    samplingRate: comp ? comp.samplingRate : 48000,
    audioChannels: comp ? comp.audioChannels : 2,
  }

  return (
    <Container
      footer={
        <>
          <Button kind="normal" onClick={handleCancel}>
            {t(t.k.cancel)}
          </Button>
          <Button kind="primary" onClick={handleSubmit}>
            {comp ? t(t.k.apply) : t(t.k.create)}
          </Button>
        </>
      }
    >
      <form ref={formRef} className={FormStyle.formHorizontal}>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.compositionName)}:</label>
          <div className="input">
            <div className="formControl">
              <input name="name" type="text" defaultValue={values.name} required autoFocus />
            </div>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.dimensions)}:</label>
          <div className="inputs">
            <div className="formControl">
              <input name="width" type="number" min="1" defaultValue={values.width} required style={{ width: '6em' }} />
            </div>
            <span className="unit"> x </span>
            <div className="formControl">
              <input
                name="height"
                type="number"
                min="1"
                defaultValue={values.height}
                required
                style={{ width: '6em' }}
              />
            </div>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.backgroundColor)}:</label>
          <div className="inputs">
            <div className="formControl">
              <input
                name="backgroundColor"
                type="color"
                defaultValue={values.backgroundColor}
                style={{
                  borderBottom: 'none',
                  padding: 0,
                  height: 24,
                  width: 20,
                  verticalAlign: 'middle',
                }}
                required
              />
            </div>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.framerate)}:</label>
          <div className="inputs">
            <div className="formControl">
              <input
                name="framerate"
                type="number"
                min="1"
                defaultValue={values.framerate}
                required
                style={{ width: '6em' }}
              />
            </div>
            <span className="unit">fps</span>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.durationSec)}:</label>
          <div className="inputs">
            <div className="formControl">
              <input
                name="durationSeconds"
                type="number"
                min="1"
                defaultValue={values.durationSeconds}
                required
                style={{ width: '6em' }}
              />
            </div>
            <span className="unit">s</span>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.samplingRate)}:</label>
          <div className="inputs">
            <div className="formControl">
              <select name="samplingRate" defaultValue={values.samplingRate} required>
                <option value="48000">48000</option>
                <option value="41000">41000</option>
              </select>
            </div>
            <span className="unit">Hz</span>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">{t(t.k.fields.audioChannels)}:</label>
          <div className="inputs">
            <div className="formControl">
              <select name="audioChannels" defaultValue={values.audioChannels} required>
                <option value="2">{t(t.k.values.audioChannels.stereo)}</option>
                <option value="1">{t(t.k.values.audioChannels.mono)}</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Container>
  )
}
