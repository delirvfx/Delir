import { validatePluginPackageJSON } from '../plugin-registry'

describe('PluginRegistry#validatePluginPackageJSON', () => {
    it('Should passing assertion with valid package.json', () => {
           const actual1 = validatePluginPackageJSON({
                name: 'delir-plugin',
                version: '0.0.0',
                author: 'Lorem <lorem@ipsum.com>',
                engines: {
                    'delir-core': '0.0.0-alpha.x',
                },
                delir: {
                    name: 'spec',
                    type: 'post-effect',
                },
            })

            expect(actual1.valid).to.ok()
            expect(actual1.errors).to.empty()

           const actual2 = validatePluginPackageJSON({
                name: 'delir-plugin',
                version: '0.0.0',
                author: 'Lorem <lorem@ipsum.com>',
                engines: {
                    'delir-core': '0.0.0-alpha.x',
                },
                delir: {
                    name: 'spec',
                    type: 'post-effect',
                    acceptFileTypes: {
                        pmd: 'model',
                        pmx: 'model',
                        vmd: 'motion',
                    }
                },
            })

            expect(actual2.valid).to.ok()
            expect(actual2.errors).to.empty()
    })

    describe('Should returns error with invalid package.json', () => {
        it('invalid version', () => {
            const actual = validatePluginPackageJSON({
                name: 'delir-plugin',
                version: ' ✋( ͡° ͜ʖ ͡°)', // invalid
                author: 'Lorem <lorem@ipsum.com>',
                engines: {
                    'delir-core': '0.0.x',
                },
                delir: {
                    name: 'spec',
                    type: 'post-effect',
                },
            })

            expect(actual.valid).to.not.ok()
            expect(actual.errors).length(1)
            expect(actual.errors[0]).to.be('Invalid version specified.')
        })

        it('engine not specified', () => {
            const actual1 = validatePluginPackageJSON({
                name: 'a',
                version: '0.0.0',
                author: 'Lorem <lorem@ipsum.com>',
                // engines: {
                //     'delir-core': '0.0.x',
                // },
                delir: {
                    name: 'spec',
                    type: 'post-effect',
                },
            })

            expect(actual1.valid).to.not.ok()
            expect(actual1.errors).length(1)
            expect(actual1.errors[0]).to.be('The prop `engines` is marked as required in `package.json of a`, but its value is `undefined`.')

            const actual2 = validatePluginPackageJSON({
                name: 'delir-plugin',
                version: '0.0.0',
                author: 'Lorem <lorem@ipsum.com>',
                engines: {
                    // 'delir-core': '0.0.x',
                },
                delir: {
                    name: 'spec',
                    type: 'post-effect',
                },
            })

            expect(actual2.valid).to.not.ok()
            expect(actual2.errors).length(1)
            expect(actual2.errors[0]).to.be('Invalid engines.delir version specified.')
        })

        it('delir.type not specified', () => {
            const actual = validatePluginPackageJSON({
                name: 'delir-plugin',
                version: '0.0.0',
                author: 'Lorem <lorem@ipsum.com>',
                engines: {
                    'delir-core': '0.0.x',
                },
                delir: {
                    name: 'spec',
                    // type: 'post-effect', // invalid
                },
            })

            expect(actual.valid).to.not.ok()
            expect(actual.errors).length(1)
            expect(actual.errors[0]).to.be('The prop `delir.type` is marked as required in `package.json of delir-plugin`, but its value is `undefined`.')
        })

        // it('Invalid delir.acceptFileTypes', () => {
        //     const actual = validatePluginPackageJSON({
        //         name: 'delir-plugin',
        //         version: '0.0.0',
        //         author: 'Lorem <lorem@ipsum.com>',
        //         engines: {
        //             'delir-core': '0.0.x',
        //         },
        //         delir: {
        //             name: 'spec',
        //             type: 'post-effect',
        //             acceptFileTypes: {
        //                 PMD: 'model',
        //                 PMX: 'model',
        //                 VMD: 'motion',
        //             }
        //         },
        //     })

        //     expect(actual.valid).to.not.ok()
        //     expect(actual.errors).length(1)
        //     expect(actual.errors[0]).to.be('File type extension must be lowercase in `package.json of delir-plugin`.')
        // })
    })
})
