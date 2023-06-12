const Group=require('../models/group');

const findByPk=(pk)=>{
    return Group.findByPk(pk);
}

const findOne=(details)=>{
    return Group.findOne(details);
}

const findAll=(details)=>{
    return Group.findAll(details);
}

const create=(details)=>{
    return Group.create(details);
}

module.exports={
    findByPk,
    findOne,
    findAll,
    create
}