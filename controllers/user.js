const bcrypt = require('bcrypt');
const UserServices = require('../services/userservices');
const JwtServices = require('../services/jwtservices');
const Sequelize = require('sequelize');

const postUserSignup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Something is missing' });
        }
        const user = await UserServices.findOne({ where: { [Sequelize.Op.or]: [{ email }, { phone }] } });
        if (user) {
            return res.status(409).json({ message: 'User already exists.Please Login' })
        }
        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            if (err) {
                console.log(err);
                throw new Error();
            }
            const user = await UserServices.create({ name, email, phone, password: hash });
            console.log(user.id, user.name);
            res.status(201).json({ message: 'User created successfully', token: JwtServices.generateToken(user.id, user.name) });
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const postUserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({message:'Enter email and password both to proceed'});
        }
        const user=await UserServices.findOne({where:{email}});
        if(!user){
            return res.status(404).json({ message: 'User not found.Please Signup' })
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if(err){
                throw new Error();
            }
            if (result) {
                res.status(200).json({message:'User login successfully',token:JwtServices.generateToken(user.id,user.name)});
            } else {
                res.status(401).json({message:'Incorrect Password'});
            }
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

module.exports = {
    postUserSignup,
    postUserLogin,
}