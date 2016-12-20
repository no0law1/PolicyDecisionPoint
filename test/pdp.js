"use strict"

const assert = require('assert')
const pdp = require('../index')

describe('Policy Decision Point', function() {

    describe('#configure()', function() {
        it('should configure correctly', function(done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                done()
            })
        })
    })

    describe('#isPermitted()', function () {
        it('no user', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                assert.throws(
                    () => {
                        pdp.isPermitted('guest', 'kick')
                    },
                    Error,
                    'user is not in session'
                )
                done()
            })
        })

        it('should be permitted simple', function (done) {
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                done()
            })
        })

        it('should login with two roles', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ["designer", "social"]))
                done()
            })
        })

        it('should login with role of hierarchy', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ["user"]))
                done()
            })
        })

        it('should throw error user does not exist', function (done) {
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
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
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                pdp.resetSession()
                assert(pdp.login('nuno', ['admin']))
                pdp.logout('nuno')
                assert.throws(
                    () => {
                        pdp.isPermitted('nuno', 'write')
                    },
                    Error,
                    'user is not in session'
                )
                done()
            })
        })
    })
})