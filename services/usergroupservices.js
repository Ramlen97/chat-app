const UserGroup=require('../models/usergroup');

const findByPk=(pk)=>{
    return UserGroup.findByPk(pk);
}

const findOne=(details)=>{
    return UserGroup.findOne(details);
}

const findAll=(details)=>{
    return UserGroup.findAll(details);
}

const addUser=(group,user,details)=>{
    return group.addUser(user,details);
}

const addGroup=(user,group,details)=>{
    return user.addGroup(group,details);
}

const update=(details,where)=>{
    return UserGroup.update(details,where);
}

const destroy=(details)=>{
    return UserGroup.destroy(details);
}

module.exports={
    findByPk,
    findOne,
    findAll,
    addUser,
    addGroup,
    update,
    destroy
}