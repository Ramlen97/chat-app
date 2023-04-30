const Sequelize=require('sequelize');
const sequelize=require('../util/database');

const Message=sequelize.define('message',{
    text:Sequelize.STRING
})

module.exports=Message;