require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./util/database');
const userRoutes = require('./routes/user');

const app = express();

app.use(bodyParser.json());
app.use('/', userRoutes);

sequelize
    .sync()
    .then(result => {
        app.listen(process.env.PORT);
    })
    .catch(err => console.log(err))

