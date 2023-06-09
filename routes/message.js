const express=require('express');
const userAuthentication=require('../middleware/auth');
const messageControllers=require('../controllers/message');


const router=express.Router();

router.post('/save',userAuthentication,messageControllers.postSaveMessage);

router.get('/new',userAuthentication,messageControllers.getNewMessages);

router.get('/old',userAuthentication,messageControllers.getOldMessages)


module.exports=router;