const Notification=require('../models/Notification');
exports.list=async(req,res)=>res.json({success:true,data:await Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(100)});
exports.read=async(req,res)=>{const n=await Notification.findOneAndUpdate({_id:req.params.id,user:req.user._id},{read:true},{new:true});if(!n)return res.status(404).json({success:false,message:'Notification not found'});res.json({success:true,data:n});};
exports.readAll=async(req,res)=>{await Notification.updateMany({user:req.user._id,read:false},{read:true});res.json({success:true,message:'All notifications marked as read'});};
exports.remove=async(req,res)=>{const n=await Notification.findOneAndDelete({_id:req.params.id,user:req.user._id});if(!n)return res.status(404).json({success:false,message:'Notification not found'});res.json({success:true,message:'Notification deleted'});};
