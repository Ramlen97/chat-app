const Group = require('../models/group');
const UserGroup = require('../models/usergroup');
const User = require('../models/user');
const Sequelize = require('sequelize');

const getNewGroups=async(req,res)=>{
    try {
        const {userId}=req.params;
        let groupList=req.query.groupList;
        if(!groupList){
            groupList=[];
        }
        const response=await UserGroup.findAll({where:{userId,groupId:{[Sequelize.Op.notIn]:groupList}}});
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
        const newGroup = await Group.create({ name, createdBy });
        const text = `${req.user.username} created this group`;
        const message = await req.user.createMessage({username:req.user.username,text,isUpdate:true,groupId:newGroup.id});
        const addUser = await newGroup.addUser(req.user, { through: { groupname:newGroup.name,isAdmin: true, joinedMessageId:message.id} });
        res.status(201).json({message});
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
        console.log(error);
    }
}

const getSearchUser = async (req, res) => {
    try {
        const { search } = req.query;
        const response = await User.findAll({
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
            User.findByPk(memberId),
            UserGroup.findOne({where:{userId:req.user.id,groupId}})
        ]);
        if (!response[1].isAdmin) {
            return res.status(401).json({ message: "Only admins can add new members" });
        }
        const text=`${req.user.username} added ${response[0].username} to the group`;
        const message = await req.user.createMessage({username:req.user.username,text,isUpdate:true,groupId});
        const addUser = await response[0].addGroup(groupId, {through: { groupname:response[1].groupname,isAdmin: false, joinedMessageId:message.id} });
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
        const response = await UserGroup.findAll({
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

module.exports = {
    getNewGroups,
    postCreateGroup,
    getSearchUser,
    postAddUser,
    getGroupMembers
}