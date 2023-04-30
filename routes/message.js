const express=require('express');
const userAuthentication=require('../middleware/auth');
const messageControllers=require('../controllers/message');


const router=express.Router();

router.post('/',userAuthentication,messageControllers.postMessage);

module.exports=router;