require('dotenv').config();
const path=require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors');

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const messageRoutes=require('./routes/message');
const User=require('./models/user');
const Message=require('./models/message');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/message',messageRoutes);

app.use((req,res)=>{
    console.log('url ==>',req.url);
    if (req.url==="/"){
        return res.redirect('login/login.html');
    }
    res.sendFile(path.join(__dirname,`public/${req.url}`));
})

User.hasMany(Message);
Message.belongsTo(User);

sequelize
    .sync()
    .then(result => {
        app.listen(process.env.PORT);
    })
    .catch(err => console.log(err))

