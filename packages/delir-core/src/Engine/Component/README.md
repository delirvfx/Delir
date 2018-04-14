# Component
`Component` is a class that has a link between a renderer instance and an entity, and propagation to renderer instance of the life cycle.

Component tree mutates by `DocumentChangeApplyer` on detect document change event.
(Ex. When a `Composition` is remove from document, `DocumentChangeApplyer` deactivate and remove related `CompositionComponent`)

## Why
When code corresponding to `Document` change processes are implemented in the `Engine`, the concern of the `Engine` increases and the role becomes complicated.
Therefore, according to SoC, delegate the processing that causes side effects to the tree to `DocumentChangeApplyer`, and keep the amount of code in the Engine low.

> Actually I'd like to do smart difference detection and manage lifecycle like React, but implementing it is too time consuming and adds complexity unnecessarily.

