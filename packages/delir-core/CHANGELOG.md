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
