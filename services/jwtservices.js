const jwt = require('jsonwebtoken');

const generateToken=(id,name)=>{
    // console.log(id); 
    return jwt.sign({userId:id,name:name},process.env.TOKEN_SECRET);
}

const verify=(token,key)=>{
    return jwt.verify(token,key);
}

module.exports={
    generateToken,
    verify
}