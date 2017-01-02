"use strict"

const assert = require('assert')
const pdpFactory = require('../index')
const fs = require('fs')

describe('Policy Decision Point', function() {

    describe('#configure()', function() {
        it('should configure correctly async', function(done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                done()
            })
        })

        it('should configure correctly sync', function(done) {
            pdpFactory.initSync('./test/model.json')
            done()
        })

        it('should be permitted simple sync', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')

            pdp.resetSession()
            assert(pdp.login('nuno', ['admin']))
            assert.equal(true, pdp.isPermitted('nuno', 'kick'))
            done()
        })

        it('should configure correctly with json', function(done) {
            pdpFactory.initWithJson('./test/model.json')
            done()
        })

        it('should be permitted simple with json', function (done) {
            const pdp = pdpFactory.initWithJson(JSON.parse(fs.readFileSync('./test/model.json')))

            pdp.resetSession()
            assert(pdp.login('nuno', ['admin']))
            assert.equal(true, pdp.isPermitted('nuno', 'kick'))
            done()
        })
    })

    describe('#isPermitted()', function () {
        it('no user', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                assert(pdp.isPermitted('guest', 'kick') == false)
                done()
            })
        })

        it('should be permitted simple', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                assert.equal(true, pdp.isPermitted('nuno', 'kick'))
                done()
            })
        })

        it('should not be permitted simple', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('joao', ['user']))
                assert.equal(false, pdp.isPermitted('joao', 'write'))
                done()
            })
        })

        it('should be permitted child permission', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                assert.equal(true, pdp.isPermitted('nuno', 'write'))
                done()
            })
        })

        it('should be permitted child away permission', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                assert.equal(true, pdp.isPermitted('nuno', 'read'))
                done()
            })
        })

        it('should check roles permission', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('andre', ["designer", "social"]))
                assert.equal(true, pdp.isPermitted('andre', 'chat'))
                done()
            })
        })
    })

    describe('#login()', function () {
        it('should login simple', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                done()
            })
        })

        it('should login with two roles', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ["designer", "social"]))
                done()
            })
        })

        it('should login with role of hierarchy', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ["user"]))
                done()
            })
        })

        it('should throw error user does not exist', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert.throws(
                    () => {
                        pdp.login('guest', ["user"])
                    },
                    Error,
                    'user does not exist'
                )
                done()
            })
        })

        it('should return true already in session', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ["admin"]))
                assert(pdp.login('nuno', ["admin"]))
                done()
            })
        })
    })

    describe('#logout()', function () {
        it('should logout user', function (done) {
            pdpFactory.init('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                pdp.logout('nuno')
                assert(pdp.isPermitted('nuno', 'write') == false)
                done()
            })
        })
    })

    describe('#userRoles()', function () {
        it('should get user', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')
            assert.deepEqual(["user"], pdp.userRoles('joao'))
            done()
        })

        it('should get designer social and user', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')
            assert.equal(["designer", "social", "user"], pdp.userRoles('andre'))
            done()
        })

        it('should give all roles', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')
            assert.equal(["admin", "designer", "social", "user"], pdp.userRoles('nuno'))
            done()
        })
    })

    describe('#grantRoles()', function () {
        it('should grant role', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')
            pdp.resetSession()
            pdp.login('nuno', ['designer'])
            assert(pdp.isPermitted('nuno', 'write'))
            assert(!pdp.isPermitted('nuno', 'chat'))
            pdp.grantRoles('nuno', ['social'])
            assert(pdp.isPermitted('nuno', 'chat'))
            done()
        })

        it('should throw error', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')
            pdp.resetSession()
            assert.throws(
                () => {
                    pdp.grantRoles('nuno', ["user"])
                },
                Error,
                'user not logged'
            )
            done()
        })

        it('should grant several roles', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')

            pdp.resetSession()
            pdp.login('nuno', ['user'])
            assert(pdp.isPermitted('nuno', ['read']))
            pdp.grantRoles('nuno', ['designer', 'social'])
            assert(pdp.isPermitted('nuno', 'chat'))
            assert(pdp.isPermitted('nuno', 'write'))
            done()
        })

        it('should ignore roles that do not exist in role hierarchy', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')

            pdp.resetSession()
            pdp.login('joao', ['user'])
            assert(pdp.isPermitted('joao', 'read'))
            pdp.grantRoles('joao', ['admin'])
            assert(!pdp.isPermitted('joao', 'kick'))
            done()
        })
    })

    describe('#revokeRoles()', function () {
        it('should revoke role', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')

            pdp.resetSession()
            pdp.login('nuno', ['designer', 'social'])
            assert(pdp.isPermitted('nuno', 'write'))
            assert(pdp.isPermitted('nuno', 'chat'))
            pdp.revokeRoles('nuno', ['social'])
            assert(!pdp.isPermitted('nuno', 'chat'))
            done()
        })

        it('should throw error user not logged', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')

            pdp.resetSession()
            assert.throws(
                () => {
                    pdp.revokeRoles('nuno', ["user"])
                },
                Error,
                'user not logged'
            )
            done()
        })

        it('should revoke several roles', function (done) {
            const pdp = pdpFactory.initSync('./test/model.json')

            pdp.resetSession()
            pdp.login('nuno', ['admin', 'designer', 'social', 'user'])
            assert(pdp.isPermitted('nuno', 'kick'))
            assert(pdp.isPermitted('nuno', 'write'))
            pdp.revokeRoles('nuno', ['admin', 'designer'])
            assert(!pdp.isPermitted('nuno', 'kick'))
            assert(!pdp.isPermitted('nuno', 'write'))
            assert(pdp.isPermitted('nuno', 'chat'))
            done()
        })
    })
})
