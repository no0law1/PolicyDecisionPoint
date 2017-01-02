# PolicyDecisionPoint
Intended for educational purposes only

# Introduction

This policy decision point respects access control 
based on roles and their hierarchies.

# Install
```
$ npm install --save policy-decision-point
```

# Usage
Requires a config file which has to be json.

**Ex:**
```json
{
    "UA": {},
    "PA": {},
    "RH": {}
}
```

For more specific example, see test/model.json

```js
    const pdpFactory = require('policy-decision-point')
    
    pdpFactory.init('pathOfFile', (err, pdp) => {
       
       //
       pdp.resetSession()
       
       // Login your user if exists in file/json and grants access to roles
       pdp.login(user, roles)
       
       // Returns all roles that a user can access 
       pdp.userRoles(user)
       
       // Grants a set of roles if user is logged and are represented in file/json
       pdp.grantRoles(user, roles)
       
       // Revokes a set of roles if user is logged and are represented in file/json
       pdp.revokeRoles(user, roles)
       
       // Logs out the user
       pdp.logout(user)
       
       // Checks if user has such permission
       pdp.isPermitted(user, permission)
    })
    
    const pdp = pdpFactory.initSync('pathOfFile')
     
    const pdp = pdpFactory.initWithJson({
         "UA": {},
         "PA": {},
         "RH": {}
    })
```



