require('dotenv').config();
const path=require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors');

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRoutes);

sequelize
    .sync()
    .then(result => {
        app.listen(process.env.PORT);
    })
    .catch(err => console.log(err))

