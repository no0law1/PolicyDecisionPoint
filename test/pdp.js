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
                    'user does not exist'
                )
                done()
            })
        })

        it('should be permitted simple', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                assert.equal(true, pdp.isPermitted('nuno', 'kick'))
                done()
            })
        })

        it('should not be permitted simple', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                assert.equal(false, pdp.isPermitted('joao', 'write'))
                done()
            })
        })

        it('should be permitted child permission', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                assert.equal(true, pdp.isPermitted('nuno', 'write'))
                done()
            })
        })

        it('should be permitted child away permission', function (done) {
            pdp('./test/model.json', (err, pdp) => {
                if(err){
                    done(err)
                }
                assert.equal(true, pdp.isPermitted('nuno', 'read'))
                done()
            })
        })
    })
})