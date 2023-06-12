const User=require('../models/user');

const findByPk=(pk)=>{
    return User.findByPk(pk);
}

const findOne=(details)=>{
    return User.findOne(details);
}

const findAll=(details)=>{
    return User.findAll(details);
}

const create=(details)=>{
    return User.create(details);
}

const update=(user,details)=>{
    return user.update(details);
}

const createMessage=(user,details)=>{
    return user.createMessage(details);
}

const createForgotpassword=(user,details)=>{
    return user.createForgotpassword(details);
}

module.exports={
    findByPk,
    findOne,
    findAll,
    create,
    update,
    createMessage,
    createForgotpassword
}