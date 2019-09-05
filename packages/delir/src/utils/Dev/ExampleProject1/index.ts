import * as Delir from '@delirvfx/core'
import { join } from 'path'

const dirname = join(process.cwd(), 'packages/delir/src/utils/Dev/ExampleProject1')
const assign = <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)

const fps = 30
const durationFrames = fps * 10
const project = new Delir.Entity.Project({})

const videoAsset = new Delir.Entity.Asset({
  name: 'BigBuckBunny',
  fileType: 'mp4',
  path: 'file://' + join(dirname, 'big_buck_bunny.mp4'),
})

const audioAsset = new Delir.Entity.Asset({
  name: 'Audio',
  fileType: 'mp3',
  path: 'file://' + join(dirname, 'Dawn.mp3'),
})

const imageAsset = new Delir.Entity.Asset({
  name: 'Image',
  fileType: 'png',
  path: 'file://' + join(dirname, 'image.png'),
})
;[videoAsset, audioAsset, imageAsset].forEach(asset => project.addAsset(asset))

// Maser Composition
const composition = new Delir.Entity.Composition({
  name: 'Master Composition',
  width: 640,
  height: 360,
  framerate: fps,
  durationFrames: durationFrames,
  audioChannels: 2,
  samplingRate: 48000,
  backgroundColor: new Delir.Values.ColorRGB(0, 188, 255),
})

project.addComposition(composition)

const layer1 = new Delir.Entity.Layer({
  name: 'Audio',
})

const layer2 = new Delir.Entity.Layer({
  name: '🔥 FIRE 🔥',
})

const layer3 = new Delir.Entity.Layer({
  name: 'NYAN = ^ . ^ = CAT',
})

const layer4 = new Delir.Entity.Layer({
  name: 'GENERATIVE',
})
const layer5 = new Delir.Entity.Layer({
  name: 'VERY CUTE 🐰-CHAN',
})

const layer0 = new Delir.Entity.Layer({
  name: 'Shape up',
})
;[layer5, layer4, layer3, layer2, layer1, layer0].forEach(layer => {
  composition.addLayer(layer)
})

//
// Clips
//

const textClip = assign(
  new Delir.Entity.Clip({
    renderer: 'text',
    placedFrame: 0,
    durationFrames,
  }),
  {
    keyframes: {
      text: [new Delir.Entity.Keyframe({ value: 'test', frameOnClip: 0 })],
      source: [
        new Delir.Entity.Keyframe({
          value: { assetId: videoAsset.id },
          frameOnClip: 0,
        }),
      ],
      loop: [new Delir.Entity.Keyframe({ value: true, frameOnClip: 0 })],
      color: [
        new Delir.Entity.Keyframe({
          value: new Delir.Values.ColorRGBA(0, 0, 0, 1),
          frameOnClip: 0,
        }),
      ],
      // x: [
      //     new Delir.Entity.Keyframe({value: 0, frameOnClip: 0, easeOutParam: [.4, .5]}),
      //     new Delir.Entity.Keyframe({value: 300, frameOnClip: 600, easeInParam: [.6, .5]}),
      // ],
      // y: [
      //     new Delir.Entity.Keyframe({value: 130, frameOnClip: 0, easeOutParam: [.4, .5]}),
      // ],
    },
    expressions: {
      text: new Delir.Values.Expression('typescript', '`time:${thisComp.time}\\nframe:${thisComp.frame}`'),
    },
  },
)

const audioClip = assign(
  new Delir.Entity.Clip({
    renderer: 'audio',
    placedFrame: 15,
    durationFrames,
  }),
  {
    keyframes: {
      source: [
        new Delir.Entity.Keyframe({
          value: { assetId: audioAsset.id },
          frameOnClip: 0,
        }),
      ],
      startTime: [
        new Delir.Entity.Keyframe({
          value: 33,
          frameOnClip: 0,
        }),
      ],
      volume: [
        new Delir.Entity.Keyframe({
          value: 60,
          frameOnClip: 0,
        }),
        new Delir.Entity.Keyframe({
          value: 60,
          frameOnClip: 120,
        }),
      ],
    },
  },
)

const imageClip = assign(
  new Delir.Entity.Clip({
    renderer: 'image',
    placedFrame: 20,
    durationFrames,
  }),
  {
    keyframes: {
      source: [
        new Delir.Entity.Keyframe({
          value: { assetId: imageAsset.id },
          frameOnClip: 0,
        }),
      ],
    },
  },
)

const adjustmentClip = new Delir.Entity.Clip({
  renderer: 'adjustment',
  placedFrame: 30,
  durationFrames: 30,
})

const p5jsClip = assign(
  new Delir.Entity.Clip({
    renderer: 'p5js',
    placedFrame: 0,
    durationFrames: 30 * 10,
  }),
  {
    keyframes: {
      sketch: [
        new Delir.Entity.Keyframe({
          frameOnClip: 0,
          value: new Delir.Values.Expression(
            'javascript',
            `
// Link: https://p5js.org/examples/simulate-snowflakes.html
let snowflakes = []; // array to hold snowflake objects
let img

function setup() {
    // createCanvas(400, 600);
    // fill(240);
    noStroke();
    img = loadImage('delir:${imageAsset.id}')
}

function draw() {
    // background('brown');
    clear();
    image(img, 0, 0, img.width / 6, img.height / 6);
    let t = frameCount / 60; // update time

    // create a random number of snowflakes each frame
    for (var i = 0; i < random(5); i++) {
        snowflakes.push(new snowflake()); // append snowflake object
    }

    let color = thisClip.effect('Color').params.value
    fill(color.r, color.g, color.b, color.a)

    // loop through snowflakes with a for..of loop
    for (let flake of snowflakes) {
        flake.update(t); // update snowflake position
        flake.display(); // draw snowflake
    }
}

// snowflake class
function snowflake() {
    // initialize coordinates
    this.posX = 0;
    this.posY = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(2, 5);

    // radius of snowflake spiral
    // chosen so the snowflakes are uniformly spread out in area
    this.radius = sqrt(random(pow(width / 2, 2)));

    this.update = function(time) {
        // x position follows a circle
        let w = 0.6; // angular speed
        let angle = w * time + this.initialangle;
        this.posX = width / 2 + this.radius * sin(angle);

        // different size snowflakes fall at slightly different y speeds
        this.posY += pow(this.size, 0.5);

        // delete snowflake if past end of screen
        if (this.posY > height) {
            let index = snowflakes.indexOf(this);
            snowflakes.splice(index, 1);
        }
    };

    this.display = function() {
        ellipse(this.posX, this.posY, this.size);
    };
}
`,
          ),
        }),
      ],
    },
  },
)

const videoClip = assign(
  new Delir.Entity.Clip({
    renderer: 'video',
    placedFrame: 0,
    durationFrames: 30 * 10,
  }),
  {
    keyframes: {
      source: [
        new Delir.Entity.Keyframe({
          value: { assetId: videoAsset.id },
          frameOnClip: 0,
        }),
      ],
      x: [
        new Delir.Entity.Keyframe({
          value: 0,
          frameOnClip: 0,
          easeOutParam: [1, 0],
        }),
        new Delir.Entity.Keyframe({
          value: 300,
          frameOnClip: 300,
          easeInParam: [1, 1],
        }),
      ],
    },
  },
)

const shapeClip = assign(
  new Delir.Entity.Clip({
    renderer: 'shape',
    placedFrame: 0,
    durationFrames: 200,
  }),
  {
    keyframes: {
      shape: [
        new Delir.Entity.Keyframe({
          value:
            'M146.38,2.26l44.34,89.84l0.23,0.47l0.52,0.08l99.14,14.41l-71.74,69.93l-0.38,0.37l0.09,0.52l16.94,98.74l-88.68-46.62' +
            'l-0.47-0.24l-0.47,0.24l-88.68,46.62l16.94-98.74l0.09-0.52l-0.38-0.37L2.15,107.05l99.14-14.41l0.52-0.08l0.23-0.47L146.38,2.26' +
            ' M146.38,0l-45.23,91.66L0,106.35l73.19,71.34L55.91,278.44l90.47-47.56l90.47,47.56L219.57,177.7l73.19-71.34l-101.15-14.7' +
            'L146.38,0L146.38,0z',
          frameOnClip: 0,
        }),
        new Delir.Entity.Keyframe({
          value: 'M99.13,2l97.4,168.7H1.73L99.13,2 M99.13,0L0,171.7h198.26L99.13,0L99.13,0',
          frameOnClip: 100,
        }),
      ],
    },
  },
)

layer0.addClip(shapeClip)
layer1.addClip(adjustmentClip)
layer2.addClip(textClip)
layer3.addClip(audioClip)
layer4.addClip(p5jsClip)
layer5.addClip(videoClip)

//
// Effects
//
adjustmentClip.addEffect(
  assign(
    new Delir.Entity.Effect({
      processor: '@delirvfx/posteffect-the-world',
    }),
    {
      // keyframes: {
      //     color: [
      //         assign(new Delir.Entity.Keyframe(), {
      //             frameOnClip: 40,
      //             value: new Delir.Values.ColorRGBA(30, 170, 200, 1),
      //         }),
      //         assign(new Delir.Entity.Keyframe(), {
      //             frameOnClip: 200,
      //             value: new Delir.Values.ColorRGBA(200, 170, 30, 1),
      //         }),
      //     ]
      // }
    },
  ),
)

p5jsClip.addEffect(
  assign(
    new Delir.Entity.Effect({
      processor: '@delirvfx/posteffect-chromakey',
    }),
    {
      keyframes: {
        keyColor: [
          new Delir.Entity.Keyframe({
            frameOnClip: 0,
            value: new Delir.Values.ColorRGBA(255, 255, 255, 1),
          }),
        ],
      },
    },
  ),
)

p5jsClip.addEffect(
  assign(
    new Delir.Entity.Effect({
      processor: '@delirvfx/posteffect-color-slider',
      referenceName: 'Color',
    }),
    {
      keyframes: {
        value: [
          new Delir.Entity.Keyframe({
            frameOnClip: 0,
            value: new Delir.Values.ColorRGBA(0, 0, 0, 255),
          }),
          new Delir.Entity.Keyframe({
            frameOnClip: 150,
            value: new Delir.Values.ColorRGBA(255, 255, 255, 255),
          }),
        ],
      },
    },
  ),
)

export default project
