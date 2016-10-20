import * as Validators from '../../src/services/validators'

describe('Assert Plugin package.json', () => {

    it('Should passing assertion with valid package.json', () => {
        (() => {
            Validators.delirPackageJson({
                name: '',
                version: '0.0.0',
                author: 'Lorem <lorem@ipsum.com>',
                engines: {
                    delir: '0.0.x',
                },
                delir: {
                    feature: 'CustomLayer',
                    targetApi: {
                        renderer: '0.0.x',
                    }
                },
            })
        })()
    })

    describe('Should throw error with invalid package.json', () => {
        it('invalid version', () => {
            expect(() => {
                Validators.delirPackageJson({
                    name: '',
                    version: ' ✋( ͡° ͜ʖ ͡°)', // invalid
                    author: 'Lorem <lorem@ipsum.com>',
                    engines: {
                        delir: '0.0.x',
                    },
                    delir: {
                        feature: 'CustomLayer',
                        targetApi: {
                            renderer: '0.0.x',
                        }
                    },
                })
            }).to.throwException()
        })

        it('engine not specified', () => {
            expect(() => {
                Validators.delirPackageJson({
                    name: '',
                    version: '0.0.0',
                    author: 'Lorem <lorem@ipsum.com>',
                    // engines: {
                    //     delir: '0.0.x',
                    // },
                    delir: {
                        feature: 'CustomLayer',
                        targetApi: {
                            renderer: '0.0.x',
                        }
                    },
                })
            }).to.throwException()

            expect(() => {
                Validators.delirPackageJson({
                    name: '',
                    version: '0.0.0',
                    author: 'Lorem <lorem@ipsum.com>',
                    engines: {
                        // delir: '0.0.x',
                    },
                    delir: {
                        feature: 'CustomLayer',
                        targetApi: {
                            renderer: '0.0.x',
                        }
                    },
                })
            }).to.throwException()
        })

        it('delir.feature not specified', () =>{
            expect(() => {
                Validators.delirPackageJson({
                    name: '',
                    version: ' ✋( ͡° ͜ʖ ͡°)', // invalid
                    author: 'Lorem <lorem@ipsum.com>',
                    engines: {
                        delir: '0.0.x',
                    },
                    delir: {
                        // feature: 'CustomLayer',
                        targetApi: {
                            renderer: '0.0.x',
                        }
                    },
                })
            }).to.throwException()
        })
    })

})
