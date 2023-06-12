const GroupServices=require('../services/groupservices');
const UserGroupServices=require('../services/usergroupservices');
const UserServices=require('../services/userservices');
const MessageServices=require('../services/messageservices');
const User=require('../models/user');
const Sequelize = require('sequelize');

const getAllGroups = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await UserGroupServices.findAll({ where: { userId}});
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const postCreateGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const createdBy = req.user.id;
        const newGroup = await GroupServices.create({ name, createdBy });
        const text = `${req.user.username} created this group`;
        const message = await UserServices.createMessage(req.user,{ username: req.user.username, text, isUpdate: true, groupId: newGroup.id });
        const addUser = await UserGroupServices.addUser(newGroup,req.user, { through: { groupname: newGroup.name, isAdmin: true, joinedMessageId: message.id } });
        res.status(201).json({ message });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const getSearchUser = async (req, res) => {
    try {
        const { search } = req.query;
        const response = await UserServices.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { email: { [Sequelize.Op.like]: `%${search}%` } },
                    { username: { [Sequelize.Op.like]: `%${search}%` } },
                    { phone: { [Sequelize.Op.like]: `%${search}%` } }
                ]
            },
            attributes: ['id', 'username']
        });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const postAddUser = async (req, res) => {
    try {
        const { memberId, groupId } = req.body;
        const response = await Promise.all([
            UserServices.findByPk(memberId),
            UserGroupServices.findOne({ where: { userId: req.user.id, groupId } })
        ]);
        if (!response[1].isAdmin) {
            return res.status(401).json({ message: "Only admins can add new members" });
        }
        const text = `${req.user.username} added ${response[0].username} to the group`;
        const message = await UserServices.createMessage(req.user,{ username: req.user.username, text, isUpdate: true, groupId });
        const addUser = await UserGroupServices.addGroup(response[0],groupId, { through: { groupname: response[1].groupname, isAdmin: false, joinedMessageId: message.id } });
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const response = await UserGroupServices.findAll({
            attributes: ['userId'],
            where: { groupId },
            include: [
                {
                    model: User,
                    attributes: ['username']
                }
            ],
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const postMakeAdmin = async (req, res) => {
    try {
        const { memberId, groupId } = req.body;
        const verifyAdmin = await UserGroupServices.findOne({ where: { userId: req.user.id, groupId } });
        if (!verifyAdmin.isAdmin) {
            return res.status(401).json({ message: "Only admins can make new admin" });
        }
        const update=await UserGroupServices.update({isAdmin:true},{where:{userId:memberId,groupId}});
        res.status(200).json(update);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const postRemoveMember= async (req, res) => {
    try {
        const { memberId, groupId,membername } = req.body;
        const verifyAdmin = await UserGroupServices.findOne({ where: { userId: req.user.id, groupId } });
        if (!verifyAdmin.isAdmin) {
            return res.status(401).json({ message: "Only admins can remove a member from the group" });
        }
        const text=`${req.user.username} removed ${membername} from the group`;
        const response=await Promise.all([
            MessageServices.create({ userId:memberId,username: req.user.username, text, isUpdate: true, groupId }),
            UserGroupServices.destroy({where:{userId:memberId,groupId}})
        ])
        res.status(200).json(response[0]);
    } 
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

module.exports = {
    getAllGroups,
    postCreateGroup,
    getSearchUser,
    postAddUser,
    getGroupMembers,
    postMakeAdmin,
    postRemoveMember,
}