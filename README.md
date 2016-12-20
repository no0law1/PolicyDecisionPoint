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
    "UA": {...},
    "PA": {...},
    "RH": {...}
}
```

For more specific example, see test/model.json

```js
    const pdpInit = require('policy-decision-point')
    
    pdpInit.configure('pathOfFile', (err, pdp) => {
                
        // Login your user if exists in file
        pdp.login(user)
        
        // Checks if user has such permission
        pdp.isPermitted(user, permission)
        
        // Logs the user out
        pdp.logout(user)
    })
```



