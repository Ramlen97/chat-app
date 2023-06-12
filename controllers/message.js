const MessageServices = require('../services/messageservices');
const UserServices = require('../services/userservices');
const Sequelize = require('sequelize');

const postSaveMessage = async (req, res) => {
    try {
        const { text, isUpdate, groupId } = req.body;
        if (!text) {
            res.status(400).json({ message: 'text is missing' });
        }
        const response = await UserServices.createMessage(req.user, { username: req.user.username, text, isUpdate, groupId });
        res.status(201).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getNewMessages = async (req, res) => {
    try {
        const groupData = req.query.groupData;
        const response = await MessageServices.findAll({
            where: {
                [Sequelize.Op.or]: groupData.map(group => ({
                    groupId: group.groupId,
                    id: { [Sequelize.Op.gt]: group.lastMessageId }
                }))
            }
        });

        const messages={};

        for (let i = response.length - 1; i >= 0; i--) {
            let msg = response[i];
            if (!messages[msg.groupId]) {
                messages[msg.groupId] = []
            }
            if (messages[msg.groupId].length < 25) {
                messages[msg.groupId].push(msg);
            }
        }
        res.status(200).json(messages);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getOldMessages = async (req, res) => {
    try {
        const { groupId, joinedMessageId, startMessageId } = req.query;
        const response = await MessageServices.findAll({
            where: {
                groupId,
                id: {
                    [Sequelize.Op.between]: [joinedMessageId, startMessageId],
                }
            },
            order: [['id', 'DESC']],
            limit: 25
        });
        res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

module.exports = {
    postSaveMessage,
    getNewMessages,
    getOldMessages
}