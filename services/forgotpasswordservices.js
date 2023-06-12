const Forgotpassword=require('../models/forgotpassword');

const findAll=(details)=>{
    return Forgotpassword.findAll(details);
}

const findOne=(details)=>{
    return Forgotpassword.findOne(details);
}

const findByPk=(id)=>{
    return Forgotpassword.findByPk(id);
}

const update=(forgotpassword,updatedDetails)=>{
    return forgotpassword.update(updatedDetails);
}


module.exports={
    findAll,
    findOne,
    findByPk,
    update
}