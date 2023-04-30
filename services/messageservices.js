const Message=require('../models/message');

const create=(details)=>{
    return Message.create(details);
}

module.exports={
    create,
}

