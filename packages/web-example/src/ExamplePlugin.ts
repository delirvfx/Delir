import { EffectRenderContext, PostEffectBase } from '@delirvfx/core'
import randomEmoji from 'random-emoji'

export class ExamplePlugin extends PostEffectBase {
    private emojis: string[]

    public async initialize() {
        this.emojis = this.generateEmoji(10)
    }

    public async render(context: EffectRenderContext<{}>) {
        if (context.frame % 3 === 0) {
            this.emojis.push(this.generateEmoji(1))
            this.emojis.shift()
        }

        const ctx = context.destCanvas.getContext('2d')
        ctx.fillStyle = '#000'
        ctx.font = '32px "sans-serif"'
        ctx.textBaseline = 'top'
        ctx.fillText(`This is post effect ${this.emojis.join('')}`, 10, 10)
    }

    private generateEmoji(count: number) {
        return randomEmoji.random({ count }).map((e: any) => e.character)
    }
}
