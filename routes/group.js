const express=require('express');
const userAuthentication=require('../middleware/auth');
const groupControllers=require('../controllers/group');


const router=express.Router();

router.get('/new-groups/:userId',userAuthentication,groupControllers.getNewGroups);

router.post('/create',userAuthentication,groupControllers.postCreateGroup);

router.get('/search-user',userAuthentication,groupControllers.getSearchUser);

router.post('/add-user',userAuthentication,groupControllers.postAddUser);

router.get('/members/:groupId',userAuthentication,groupControllers.getGroupMembers);

module.exports=router;