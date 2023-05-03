const MessageServices = require('../services/messageservices');
const UserServices=require('../services/userservices');

const postMessage = async (req, res) => {
    try {
        const{text}=req.body;
        console.log(text);
        console.log(req.user);
        const response=await UserServices.createMessage(req.user,{text});
        res.status(201).json(response);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong'});
    }
}

const getMessage = async (req, res) => {
    try {
        const {lastMessage}=req.query;
        offset=+lastMessage;
        const response=await MessageServices.findAll({attributes:['id','username','text'],offset});
        res.status(200).json(response);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong'});
    }
}

module.exports = {
    postMessage,
    getMessage
}