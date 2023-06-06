const MessageServices = require('../services/messageservices');
const UserServices=require('../services/userservices');
const Sequelize=require('sequelize');

const postSaveMessage = async (req, res) => {
    try {
        const{text,isUpdate,groupId}=req.body;
        if (!text){
            res.status(400).json({message:'text is missing'});
        }
        const response=await UserServices.createMessage(req.user,{username:req.user.username,text,isUpdate,groupId});
        res.status(201).json(response);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong'});
    }
}

const getNewMessages = async (req, res) => {
    try {
        const groupData=req.query.groupData;
        console.log(groupData);
        const response=await MessageServices.findAll({
            where: {
              [Sequelize.Op.or]: groupData.map(group => ({
                groupId: group.groupId,
                id: { [Sequelize.Op.gt]: group.lastMessageId }
              }))
            }
          });
        
        res.status(200).json(response);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong'});
    }
}

module.exports = {
    postSaveMessage,
    getNewMessages
}