const bcrypt = require('bcrypt');
const UserServices = require('../services/userservices');
const JwtServices=require('../services/jwtservices');

const postUserSignup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Something is missing' });
        }
        const user = await UserServices.findOne({ where: { email } });
        if(user){
            return res.status(409).json({message:'User already exists.Please Login'})
        }
        const saltrounds=10;
        bcrypt.hash(password,saltrounds,async(err,hash)=>{
            if(err){
                console.log(err);
                throw new Error();
            }
            const user=await UserServices.create({name,email,phone,password:hash});
            console.log(user.id,user.name);
            res.status(201).json({message:'User created successfully',token:JwtServices.generateToken(user.id,user.name)});
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Something went wrong'} );
    }
}

module.exports = {
    postUserSignup,
}