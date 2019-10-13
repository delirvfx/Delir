import { version } from '@delirvfx/core'
import React from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'

import { Button } from '../../components/Button'
import { ExternalLink } from '../../components/ExternalLink'

import * as packageJson from '../../../../../package.json'
import { dependencies } from './Licenses'

import t from './AboutModal.i18n'
import s from './AboutModal.sass'

export const AboutModal = (props: { onClose: () => void }) => {
  return (
    <div className={s.AboutModal}>
      <Tabs>
        <TabList className={s.tabList}>
          <Tab className={s.tab} selectedClassName={s.tabSelected}>
            About
          </Tab>
          <Tab className={s.tab} selectedClassName={s.tabSelected}>
            Licenses
          </Tab>
        </TabList>
        <TabPanel>
          <h1>
            Delir<small>{packageJson.version}</small>
          </h1>
          <dl>
            <dt>Contact</dt>
            <dd>
              <ExternalLink href="https://twitter.com/@DelirVFX">Twitter: @DelirVFX</ExternalLink>
            </dd>

            <dt>GitHub</dt>
            <dd>
              <ExternalLink href="https://github.com/ra-gg/Delir">https://github.com/ra-gg/Delir</ExternalLink>
            </dd>

            <dt>Discord</dt>
            <dd>
              <ExternalLink href="https://discord.gg/rrr2z2E">DelirVFX</ExternalLink>
            </dd>

            <dt>Runtime</dt>
            <dd>
              Electron: {process.versions.electron} / Node.js: {process.versions.node}
              <br />
              @delirvfx/core: {version}
            </dd>
          </dl>
        </TabPanel>
        <TabPanel>
          <div className={s.licensesTitle}>{t(t.k.licenses.title)}</div>
          <div className={s.licenseContainer}>
            <div className={s.licenseList}>
              {dependencies.map(({ name, url }) => (
                <ExternalLink className={s.licenseLink} href={url}>
                  {name}
                </ExternalLink>
              ))}
            </div>
          </div>
        </TabPanel>
      </Tabs>
      <Button kind="normal" className={s.close} onClick={props.onClose}>
        {t(t.k.close)}
      </Button>
    </div>
  )
}
