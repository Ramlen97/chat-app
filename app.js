require('dotenv').config();
const path=require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors');

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const messageRoutes=require('./routes/message');
const groupRoutes=require('./routes/group');
const User=require('./models/user');
const Message=require('./models/message');
const Group=require('./models/group');
const Usergroup=require('./models/usergroup');

const users={};

const app = express();

app.use(cors());

const server = require('http').createServer(app);

const io = require('socket.io')(server,{
    cors:{
        origin:'*'
    }
});

io.on('connection',socket=>{
    const userId = socket.handshake.query.userId;
    users[userId]=socket.id;
    // console.log(users);

    socket.on('send-message',(message)=>{
        socket.to(message.groupId).emit('receive-message',message)
        const clientsInRoom = io.sockets.adapter.rooms.get(message.groupId);
        const socketIds = Array.from(clientsInRoom ? clientsInRoom : []);
        console.log('Socket IDs in room', message.groupId, ':', socketIds);
        console.log(users);
    })
    socket.on('join-group',groupId=>{
        socket.join(groupId);
    })
    socket.on('add-to-group',(memberId,groupname,message)=>{
        const socketId=users[memberId];
        if(socketId){
            const socketInstance=io.sockets.sockets.get(socketId);
            socketInstance.join(message.groupId);
            io.to(message.groupId).emit('new-member-added',message,memberId,groupname);
        }
    })
    socket.on('join-multiple-groups',groupList=>{
        groupList.forEach(groupId => {
            socket.join(groupId);
        });
    })
})

app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/group',groupRoutes);
app.use('/message',messageRoutes);

app.use((req,res)=>{
    console.log('url ==>',req.url);
    if (req.url==="/"){
        return res.redirect('login/login.html');
    }
    res.sendFile(path.join(__dirname,`public/${req.url}`));
})

User.hasMany(Message);
Group.hasMany(Message);
Message.belongsTo(User);
Message.belongsTo(Group);
User.belongsToMany(Group,{through:Usergroup});
Group.belongsToMany(User,{through:Usergroup});
Usergroup.belongsTo(User);
Usergroup.belongsTo(Group);


sequelize
    .sync()
    .then(result => {
        server.listen(process.env.PORT);
    })
    .catch(err => console.log(err))