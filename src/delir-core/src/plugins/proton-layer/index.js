// @flow
import Delir from '../../index'
import type PluginPreRenderRequest from '../../renderer/plugin-pre-rendering-request'
import type RenderRequest from '../../renderer/render-request'
import './proton-2.1.0'

export default class REDLAYER extends Delir.PluginBase.CustomLayerPluginBase
{
    static pluginDidLoad()
    {
        console.log('✨', 'color:#f00');
    }

    initFrame = null

    constructor()
    {
        super()

        //use Euler integration calculation is more accurate (default false)
        // Proton.USE_CLOCK = false or true;
    }

    provideParameter()
    {
        return {}
    }

    async beforeRender(req: PluginPreRenderRequest)
    {
        const canvas = this.buffer = document.createElement('canvas')
        canvas.width = req.width
        canvas.height = req.height

        this.proton = new Proton
        this.emitter = new Proton.Emitter()
        this.emitter.rate = new Proton.Rate(new Proton.Span(1, 3), 1)
        this.emitter.addInitialize(new Proton.Mass(1))
        this.emitter.addInitialize(new Proton.Radius(2, 4))
        this.emitter.addInitialize(new Proton.P(new Proton.LineZone(10, canvas.height, canvas.width - 10, canvas.height)))
        this.emitter.addInitialize(new Proton.Life(.3, .4))
        this.emitter.addInitialize(new Proton.V(new Proton.Span(4, 6), new Proton.Span(0, 0, true), 'polar'))
        this.emitter.addBehaviour(new Proton.Gravity(1))
        this.emitter.addBehaviour(new Proton.Color('#ff0000', 'random'))
        this.emitter.emit()
        this.proton.addEmitter(this.emitter)

        // this.emitter = new Proton.Emitter
        // this.emitter.rate = new Proton.Rate(Proton.getSpan(10, 20), 0.1)
        //
        // //add Initialize
        // this.emitter.addInitialize(new Proton.Radius(1, 12))
        // this.emitter.addInitialize(new Proton.Life(2, 4))
        // this.emitter.addInitialize(new Proton.Velocity(3, Proton.getSpan(0, 360), 'polar'))
        //
        // //add Behaviour
        // this.emitter.addBehaviour(new Proton.Color('ff0000', 'random'))
        // this.emitter.addBehaviour(new Proton.Alpha(1, 0))
        //
        // //set emitter position
        // this.emitter.p.x = req.width / 2
        // this.emitter.p.y = req.height / 2
        // this.emitter.emit()
        //
        // //add emitter to the proton
        // this.proton.addEmitter(this.emitter)

        this.renderer = new Proton.Renderer('webgl', this.proton, this.buffer)
        this.renderer.blendFunc("SRC_ALPHA", "ONE")
        this.renderer.start()

        const createFirstEmitter = (particle) =>{
            var subemitter = new Proton.Emitter();
            subemitter.rate = new Proton.Rate(new Proton.Span(250, 300), 1);
            subemitter.addInitialize(new Proton.Mass(1));
            subemitter.addInitialize(new Proton.Radius(1, 2));
            subemitter.addInitialize(new Proton.Life(1, 3));
            subemitter.addInitialize(new Proton.V(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'));
            subemitter.addBehaviour(new Proton.RandomDrift(10, 10, .05));
            subemitter.addBehaviour(new Proton.Alpha(1, 0));
            subemitter.addBehaviour(new Proton.Gravity(3));
            var color = Math.random() > .3 ? Proton.MathUtils.randomColor() : 'random';
            subemitter.addBehaviour(new Proton.Color(color));
            subemitter.p.x = particle.p.x;
            subemitter.p.y = particle.p.y;
            subemitter.emit('once', true);
            this.proton.addEmitter(subemitter);
        }

        const createSecendEmitter = (particle) =>{
            var subemitter = new Proton.Emitter();
            subemitter.rate = new Proton.Rate(new Proton.Span(100, 120), 1);
            subemitter.addInitialize(new Proton.Mass(1));
            subemitter.addInitialize(new Proton.Radius(4, 8));
            subemitter.addInitialize(new Proton.Life(1, 2));
            subemitter.addInitialize(new Proton.V([1, 2], new Proton.Span(0, 360), 'polar'));
            subemitter.addBehaviour(new Proton.Alpha(1, 0));
            subemitter.addBehaviour(new Proton.Scale(1, .1));
            subemitter.addBehaviour(new Proton.Gravity(1));
            var color = Proton.MathUtils.randomColor();
            subemitter.addBehaviour(new Proton.Color(color));
            subemitter.p.x = particle.p.x;
            subemitter.p.y = particle.p.y;
            subemitter.emit('once', true);
            this.proton.addEmitter(subemitter);
        }


        this.emitter.addEventListener(Proton.PARTICLE_DEAD, function(particle) {
            if (Math.random() < .7)
                createFirstEmitter(particle);
            else
                createSecendEmitter(particle);
        });

        document.body.appendChild(this.buffer)
    }

    async render(req: RenderRequest)
    {
        const canvas = req.destCanvas
        const ctx = canvas.getContext('2d')
        // const ctx = canvas.getContext('2d')

        // if (ctx == null) return
        // ctx.fillStyle = '#1647c3'
        // ctx.fillRect(0, 0, canvas.width, canvas.height)
        // ctx.translate(canvas.width / 2, canvas.height / 2);
        // ctx.rotate(req.frameOnLayer * 8 * Math.PI / 180)
        // ctx.drawImage(this.img, 0, 0, this.img.width / 4, this.img.height / 4)

        // add webgl renderer
        if (this.initFrame == null) {
            // console.log('start', this.proton, canvas);
            this.initFrame = true
        }


        this.proton.update()
        ctx.drawImage(this.buffer, 0, 0)
    }
}
