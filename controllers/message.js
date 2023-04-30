const MessageServices = require('../services/messageservices');
const UserServices=require('../services/userservices');

const postMessage = async (req, res) => {
    try {
        const{text}=req.body;
        const response=await UserServices.createMessage(req.user,{text});
        res.status(201).json({ message: 'successful' });
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong'});
    }
}

module.exports = {
    postMessage,
}