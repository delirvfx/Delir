import I18n from '../../utils/I18n'

export default I18n({
  ja: {
    sidebar: {
      renderer: 'レンダラー',
      rendererGeneral: '一般',
      devel: '開発',
      develPlugin: 'プラグイン',
    },
    rendererGeneral: {
      title: 'レンダリング / 一般',
      ignoreMissingEffect: '行方不明のエフェクトを無視する',
      ignoreMissingEffectDesc: 'エフェクトのインストール漏れを警告されたい場合はチェックを外してください',
    },
    close: '閉じる (Esc)',
  },
  en: {
    sidebar: {
      renderer: 'Renderer',
      rendererGeneral: 'General',
      devel: 'Development',
      develPlugin: 'Plugin',
    },
    rendererGeneral: {
      title: 'Rendering / General',
      ignoreMissingEffect: 'Ignore missing effect',
      ignoreMissingEffectDesc: 'Please remove the check if you want to be warned about omission of effect installation',
    },
    close: 'Close (Esc)',
  },
})
