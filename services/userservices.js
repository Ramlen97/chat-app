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

const createMessage=(user,details)=>{
    return user.createMessage(details);
}

module.exports={
    findByPk,
    findOne,
    findAll,
    create,
    createMessage,
}