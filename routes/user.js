const express=require('express');
const userAuthentication=require('../middleware/auth');
const userControllers=require('../controllers/user');

const router=express.Router();

router.post('/signup',userControllers.postUserSignup);

router.post('/login',userControllers.postUserLogin);

module.exports=router;