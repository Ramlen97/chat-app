const express=require('express');
const passwordControllers=require('../controllers/forgotpassword');

const router=express.Router();

router.post('/forgotpassword',passwordControllers.postForgotPassword);

router.get('/resetpassword/:id',passwordControllers.getResetPassword);

router.post('/updatepassword/:id',passwordControllers.postUpdatePassword);

module.exports=router;