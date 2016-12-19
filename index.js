"use strict"

const fs = require('fs')

/**
 * UA - User Assigned
 * PA - Permission Assigned
 * RH - Role Hierarchy
 */
let memoryDB = {}

function isPermittedAux(role, permission) {
    const permissions = memoryDB.PA[role]
    for(let i = 0; i<permissions.length; i++){
        if(permission == permissions[i])
            return true
    }

    const hierarchy = memoryDB.RH[role]
    for(let i = 0; i<hierarchy.length; i++){
        if(isPermittedAux(hierarchy[i], permission))
            return true
    }
    return false
}


const pdp = {

    isPermitted: function (user, permission) {
        const roles = memoryDB.UA[user]
        if(!roles){
            throw new Error('user does not exist')
        }

        for(let i = 0; i<roles.length; i++){
            if(isPermittedAux(roles[i], permission)){
                return true
            }
        }
        return false
    }
}


/**
 *
 * @param path  path of configuration file (json)
 * @param cb    (err, pdp)
 */
module.exports = function(path, cb){
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            return cb(err)
        }
        memoryDB = JSON.parse(data)
        return cb(null, pdp)
    })
}