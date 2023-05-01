const Message=require('../models/message');

const create=(details)=>{
    return Message.create(details);
}

const findAll=(details)=>{
    return Message.findAll(details);
}

module.exports={
    create,
    findAll
}

