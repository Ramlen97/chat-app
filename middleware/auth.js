const UserServices = require('../services/userservices');
const JwtServices=require('../services/jwtservices');

const authenticate = async (req, res, next) => {
    try {;
        const token = req.header('Authorization');
        // console.log(token);
        const userObj = JwtServices.verify(token);
        const user = await UserServices.findByPk(userObj.userId);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message: "User not authorized" });
    }
}

module.exports = authenticate;