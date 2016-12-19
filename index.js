"use strict"

const fs = require('fs')

// const User = require('./model/User')
// const Role = require('./model/Role')
// const Permission = require('./model/Permission')
// const Session = require('./model/Session')

/**
 * UA - User Assigned
 * PA - Permission Assigned
 * RH - Role Hierarchy
 */
var memoryDB = {}

function isPermittedAux(role, permission) {
    const permissions = memoryDB.PA[role]
    for(let i = 0; i<permissions.length; i++){
        if(permission == permissions[i])
            return true
    }

    const hierarchy = memoryDB.RH[role]
    for(let i = 0; i<hierarchy.length; i++){
        if(isPermittedAux(hierarchy[i], permission))
            return true;
    }
    return false;
}


const pdp = {

    isPermitted: function (user, permission) {
        const role = memoryDB.UA[user]
        if(!role){
            throw new Error('user does not exist')
        }

        return isPermittedAux(role, permission)
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