"use strict"

const fs = require('fs')

/**
 * Memory of the pdpFactory
 *
 * UA - User Assigned
 * PA - Permission Assigned
 * RH - Role Hierarchy
 */
let memoryDB = {}

/**
 * Used to store user sessions
 *
 * @type {{}} sessions.user.role
 */
let sessions = {}

/**
 * Auxiliary method to isPermitted()
 *
 * @param role role to check permission
 * @param permission permission to check
 * @return {boolean} true if role permits permission
 */
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

/**
 * Checks if roleToCheck exists in the collection roles passed
 *
 * @param roleToCheck string role
 * @param roles array of strings role
 * @return {boolean}
 */
function checkRole(roleToCheck, roles) {
    for(let i = 0; i<roles.length; i++){
        if(roles[i] == roleToCheck || checkRole(roleToCheck, memoryDB.RH[roles[i]])){
            return true
        }
    }
    return false
}

/**
 * Checks if user is logged
 *
 * @param user string username
 * @return {*}
 */
function isLogged(user){
    return sessions[user]
}

/**
 * gets an array containing all roles of a hierarchy of roles
 *
 * @param roles father roles to begin the hierarchy
 * @return {Array.<*>} all roles in the hierarchy (does not contain duplicates)
 */
function hierarchyRoles(roles){
    let hierarchy = []
    for(let i = 0; i<roles.length; i++){
        const subRoles = hierarchyRoles(memoryDB.RH[roles[i]])
        for(let j = 0; j < subRoles.length; j++){
            if(!hierarchy.includes(subRoles[j])){
                hierarchy.push(subRoles[j])
            }
        }
    }
    return hierarchy.concat(roles)
}


const pdp = {

    /**
     * Resets all sessions
     */
    resetSession: function () {
        sessions = {}
    },

    /**
     * Logs a user
     *
     * @param user string username
     * @param roles array of strings
     * @return {boolean} login successful
     */
    login: function (user, roles) {
        if(isLogged(user)){
            return true
        }
        const userRoles = memoryDB.UA[user]
        if(!roles){
            throw new Error('user does not exist')
        }

        for (let i = 0; i < roles.length; i++) {
            if(!checkRole(roles[i], userRoles)){
                throw new Error('no such role: '+ roles[i])
            }
        }
        sessions[user] = roles
        return true
    },

    /**
     * Retrieves all user roles
     *
     * @param user  user logged or not logged
     * @return Array roles
     */
    userRoles: function (user) {
        return hierarchyRoles(memoryDB.UA[user])
    },

    /**
     * grant a set of roles to a specific user
     *
     * @param user user to grant roles
     * @param roles roles to be granted on a user
     */
    grantRoles: function (user, roles) {
        if(!isLogged(user)) {
            throw new Error('user not logged')
        }

        for(let i = 0; i<roles.length; i++){
            if(!sessions[user].includes(roles[i]) && checkRole(roles[i], memoryDB.UA[user])){
                sessions[user].push(roles[i])
            }
        }
    },

    /**
     * removes the roles passed in the arguments to a specific user
     *
     * @param user user to revoke the roles
     * @param roles roles to revoke the user
     */
    revokeRoles: function (user, roles) {
        if(!isLogged(user)){
            throw new Error('user not logged')
        }

        for(let i = 0; i<roles.length; i++){
            if(sessions[user].includes(roles[i])){
                sessions[user].splice(sessions[user].indexOf(roles[i]), 1)
            }
        }
    },

    /**
     * Removes the user of the session
     * @param user user to delete
     */
    logout: function (user) {
        if(sessions[user]){
            delete sessions[user]
        }
    },

    /**
     * Checks if a determined user has a certain permission
     *
     * @param user string username
     * @param permission permission to check
     * @return {boolean} true if permission is allowed to user
     */
    isPermitted: function (user, permission) {
        if(!isLogged(user)){
            return false
        }
        const roles = sessions[user]

        for(let i = 0; i<roles.length; i++){
            if(isPermittedAux(roles[i], permission)){
                return true
            }
        }
        return false
    }
}

/**
 * Factories
 */
module.exports = {

    /**
     * Initial configuration through a file path, asynchronous
     *
     * @param path  path of configuration file (json)
     * @param cb    (err, pdpFactory)
     */
    init: function (path, cb) {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                return cb(err)
            }
            memoryDB = JSON.parse(data)
            return cb(null, pdp)
        })
    },

    /**
     * Initial configuration through a file path, synchronous
     *
     * @param path configuration file
     * @return {{resetSession: pdpFactory.resetSession, logout: pdpFactory.logout, login: pdpFactory.login, isPermitted: pdpFactory.isPermitted}}
     */
    initSync: function (path) {
        memoryDB = JSON.parse(fs.readFileSync(path, 'utf-8'))
        return pdp
    },

    /**
     * Takes a json made database and makes it his own
     *
     * @param json already made json database
     * @return {{resetSession: pdpFactory.resetSession, logout: pdpFactory.logout, login: pdpFactory.login, isPermitted: pdpFactory.isPermitted}}
     */
    initWithJson: function (json) {
        memoryDB = json
        return pdp
    }
}