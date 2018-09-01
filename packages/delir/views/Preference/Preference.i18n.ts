import I18n from '../../utils/I18n'

export default I18n({
    ja: {
        sidebar: {
            renderer: 'レンダラー',
            rendererGeneral: '一般',
        },
        rendererGeneral: {
            title: 'レンダリング',
            ignoreMissingEffect: '行方不明のエフェクトを無視する',
            ignoreMissingEffectDesc: 'エフェクトのインストール漏れを警告されたい場合はチェックを外してください',
        },
        close: '閉じる (Esc)',
    },
    en: {
        sidebar: {
            renderer: 'Renderer',
            rendererGeneral: 'General',
        },
        rendererGeneral: {
            title: 'Rendering',
            ignoreMissingEffect: 'Ignore missing effect',
            ignoreMissingEffectDesc: 'Please remove the check if you want to be warned about omission of effect installation',
        },
        close: 'Close (Esc)',
    },
})
