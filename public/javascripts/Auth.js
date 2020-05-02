const mod=require('../../routes/modules');
const publicKey=mod.module.fs.readFileSync('./public/keys/public.key','utf8'); //To verify the token

exports.auth={

    IsAdminAuthenticated:function()
    {
        return function(req,res,next){
       mod.module.jwt.verify(req.cookies.sessionId,publicKey,{
            subject:req.cookies.user
            ,  //intended user of the token
            algorithm:["RS256"],//signing algorithm
            expiresIn:  "60000"   //token expires in 1 min,
        },function(err,decoded)
        {
        if(err ||decoded.role !==mod.module.role.admin)
        {
        res.status(401).send(false); //No valid token/role not correct so unauthorised
        }
        else
        {
       if(req.method==="PUT" ||req.method==="POST" ||req.method==="DELETE") 
        /*To ensure this check is perfomed only for mutating requests
    since for others there will be no csrf token in the header.*/
        {
        if(decoded.csrfToken.indexOf(req.headers["x-xsrf-token"]) !==-1)
        {
           next();
        }
        else
        {
            res.status(403).send(false); //csrf token not valid
        }
    }
    else
    {
        //GET,HEAD or OPTIONS request
        next();
    }
    
        }
    
        })
    }},

    IsUserAuthenticated:function()
    {

        return function(req,res,next){
        mod.module.jwt.verify(req.cookies.sessionId,publicKey,{
            subject:req.cookies.user
            ,  //intended user of the token
            algorithm:["RS256"],//signing algorithm
            expiresIn:  "60000"   //token expires in 1 min,
        },function(err,decoded)
        {
        if(err ||(decoded.role !== mod.module.role.user && decoded.role !== mod.module.role.admin))
        {
        res.status(401).send(false); //No valid token/role so unauthorised
        }
        else
        {
            
        if(req.method==="PUT" ||req.method==="POST" ||req.method==="DELETE") 
        /*To ensure this check is perfomed only for mutating requests
    since for others there will be no csrf token in the header.*/
        {
        if(decoded.csrfToken.indexOf(req.headers["x-xsrf-token"]) !==-1)
        {
            next();
        }
        else
        {
            res.status(403).send(false); //csrf token not valid
        }
    }
    else
    {
        //GET,HEAD or OPTIONS request
        next();
    }
    
        }
    
        })
    }}


}



