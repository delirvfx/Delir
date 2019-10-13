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
