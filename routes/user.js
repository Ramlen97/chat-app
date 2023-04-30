const express=require('express');
const userControllers=require('../controllers/user');

const router=express.Router();

router.post('/signup',userControllers.postUserSignup);

router.post('/login',userControllers.postUserLogin);

module.exports=router;