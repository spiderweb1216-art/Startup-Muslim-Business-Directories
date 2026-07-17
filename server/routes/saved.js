const express=require('express');
const {requireAuth}=require('../middleware/auth');
const {getSavedItems,toggleSavedItem}=require('../services/recordService');
const router=express.Router();
router.get('/',requireAuth,async(req,res,next)=>{try{res.json({saved:await getSavedItems(req.user.id)});}catch(e){next(e);}});
router.post('/toggle',requireAuth,async(req,res,next)=>{try{const itemType=String(req.body.itemType||'');const itemKey=String(req.body.itemKey||'');if(!itemType||!itemKey)return res.status(400).json({message:'itemType and itemKey are required.'});const result=await toggleSavedItem(req.user.id,itemType,itemKey);res.json(result);}catch(e){next(e);}});
module.exports=router;
