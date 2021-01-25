### 0.12.0
- [#392](https://github.com/ra-gg/Delir/pull/392) `defaultValue` at Post effect parameter definition, now requires wrap by function for safe from unexpected default value mutation.
- [#392](https://github.com/ra-gg/Delir/pull/392) Use fontmanager-redux instead of font-manager for upgrade Node to 12
- [#392](https://github.com/ra-gg/Delir/pull/392) Upgrade Expression transpiler to TypeScript 3.7
- [#392](https://github.com/ra-gg/Delir/pull/392) Expose ColorRGB and ColorRGBA class to Expression global scope
- [#392](https://github.com/ra-gg/Delir/pull/392) Add `Engine.ExpressionSupport.createExpressionContext()` for execute expression in your post effect
- [#392](https://github.com/ra-gg/Delir/pull/392) Add `Engine.ExpressionSupport.compileTypeScript()` for compile post effect side Expression adjust to Delir-level syntax support
- [#392](https://github.com/ra-gg/Delir/pull/392) Fix out of range in Audio clip by clip placed frame
- [#392](https://github.com/ra-gg/Delir/pull/392) Fix no resampled audio to composition sampling rate
- [#392](https://github.com/ra-gg/Delir/pull/392) Add `align` parameter in Text clip
- [#392](https://github.com/ra-gg/Delir/pull/392) Add `playbackRate` parameter in Video clip
- [#392](https://github.com/ra-gg/Delir/pull/392) Add `opacity` parameter in Solid clip
- [#392](https://github.com/ra-gg/Delir/pull/392) Fix `Clip#clone()` not rehashing it keyframe entities ID
- [#392](https://github.com/ra-gg/Delir/pull/392) Improve FPS rating algorithm for no downrate on starting rendering
- [#392](https://github.com/ra-gg/Delir/pull/392) Set default value for Code parameter


### 0.11.0
- [#296](https://github.com/ra-gg/Delir/pull/296) Add `solid` clip

### 0.10.0
- [#380](https://github.com/ra-gg/Delir/pull/380) Support alpha channel (transparent background) rendering
  from `Engine#{renderFrame,renderSequencial}(options: { enableAlpha: true })`
- [#380](https://github.com/ra-gg/Delir/pull/380) `Engine#renderFrame` now accepts rendering options in 3rd argument

### 0.9.0
- [#379](https://github.com/ra-gg/Delir/pull/379) Add ParamType namespace for easy to understand relationship between parameter definition (in `#provideParameters`) and interface definition
- [#379](https://github.com/ra-gg/Delir/pull/379) Internal refactoring
- [#379](https://github.com/ra-gg/Delir/pull/379) Now disallows `engines['delir-core']` definition in plugin package.json

### 0.8.1
- [#371](https://github.com/ra-gg/Delir/pull/371) Fix incorrect WebGL uniform assigning
- [#371](https://github.com/ra-gg/Delir/pull/371) Add returned type to `Exporter.deserializeProject`

### 0.8.0
#### Breaking changes
- Refactor `KeyframeCalculator`
  - Renamed `.calcKeyframeValuesAt` -> `.calcKeyframesAt`
  - Renamed `.calcKeyframeValueAt` -> `.calcKeyframeAt`
  - Renamed `.calcKeyFrames` -> `.calcKeyframesInRange`
  - `.calcKeyframe` now privated

### 0.7.4
- #226 Fix plugin's package.json typing
- #226 Replace `joi` dependency to `joi-browser`

### 0.7.3
- [Experimental] `@delirvfx/core` now can be used as standalone package
- Export core version from `version`

### 0.7.1, 0.7.2
- Fix typing publishing

### 0.7.0
- Support WebGL post effect

### 0.6.5
- Improve rendering performance by parallel clip rendering

### 0.6.4
- Fix all layers vanished in `Composition#moveLayerIndex`
- Fix all effects vanished in `Clip#{addEffect,moveEffectIndex}`

### 0.6.3
Publishing test. no changes.

### 0.6.2
- Unhandled syntax error in p5.js or expression code now be handled
- Fix dropping head of audio for Audio clip
- Fix where the audio tail plays out of clip

### 0.6.1
- Exception in p5.js or Expression code is now thrown as UserCodeException
- Fix order of added layer inversed in `Composition#addLayer`

### 0.6.0
- Remove `ProjectHelper` and core logics moved to `Entity`
- `Asset#mimeType` removed
- Stop clamping `Keyframe#ease{In,Out}Param` Y-Axis
- Implement Parameter reference expression API
