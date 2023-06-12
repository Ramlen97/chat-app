const express=require('express');
const userAuthentication=require('../middleware/auth');
const groupControllers=require('../controllers/group');


const router=express.Router();

router.get('/get-all/:userId',userAuthentication,groupControllers.getAllGroups);

router.post('/create',userAuthentication,groupControllers.postCreateGroup);

router.get('/search-user',userAuthentication,groupControllers.getSearchUser);

router.post('/add-user',userAuthentication,groupControllers.postAddUser);

router.get('/members/:groupId',userAuthentication,groupControllers.getGroupMembers);

router.post('/make-admin',userAuthentication,groupControllers.postMakeAdmin);

router.post('/remove-member',userAuthentication,groupControllers.postRemoveMember);

module.exports=router;