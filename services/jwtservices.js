const jwt = require('jsonwebtoken');

const generateToken=(id,name)=>{
    // console.log(id); 
    return jwt.sign({userId:id,name:name},process.env.TOKEN_SECRET);
}

const verify=(token)=>{
    return jwt.verify(token,process.env.TOKEN_SECRET);
}

module.exports={
    generateToken,
    verify
}