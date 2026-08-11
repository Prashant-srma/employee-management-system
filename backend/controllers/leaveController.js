const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
function normalizeDate(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function daysBetween(a,b) { return Math.floor((normalizeDate(b)-normalizeDate(a))/86400000)+1; }
function balanceKey(type) { return { Sick:'sick', Casual:'casual', Annual:'annual', Unpaid:'unpaid' }[type] || null; }
exports.list = async (req,res) => { const q={}; const { employee,type,status,from,to }=req.query; if(employee)q.employee=employee;if(type)q.type=type;if(status)q.status=status;if(from||to){q.startDate={};if(from)q.startDate.$gte=normalizeDate(from);if(to)q.startDate.$lte=normalizeDate(to)} const items=await Leave.find(q).populate('employee','employeeId firstName lastName').populate('approvedBy','name').sort({createdAt:-1}); res.json({success:true,data:items}); };
exports.mine = async (req,res) => { const items=await Leave.find({employee:req.user.employee}).sort({createdAt:-1}); const e=await Employee.findById(req.user.employee).select('leaveBalances'); res.json({success:true,data:{items,balances:e?.leaveBalances||{}}}); };
exports.create = async (req,res) => {
  const { type,startDate,endDate,reason }=req.body; const s=normalizeDate(startDate), e=normalizeDate(endDate); if(!type||!reason||Number.isNaN(s.getTime())||Number.isNaN(e.getTime())||s>e)return res.status(400).json({success:false,message:'Please provide valid leave dates and reason'});
  const days=daysBetween(s,e); const employee=await Employee.findById(req.user.employee); const key=balanceKey(type); if(key && key!=='unpaid' && employee.leaveBalances[key] < days)return res.status(400).json({success:false,message:`Insufficient ${type.toLowerCase()} leave balance`});
  const overlap=await Leave.findOne({employee:employee._id,status:{$in:['Pending','Approved']},startDate:{$lte:e},endDate:{$gte:s}}); if(overlap)return res.status(409).json({success:false,message:'This leave overlaps another pending or approved request'});
  const leave=await Leave.create({employee:employee._id,type,startDate:s,endDate:e,reason}); const admins=await User.find({role:'admin',isActive:true}).select('_id'); await Promise.all(admins.map(a=>createNotification({user:a._id,title:'New leave request',message:`${employee.firstName} ${employee.lastName} requested ${days} day(s) of ${type.toLowerCase()} leave.`,type:'warning'}))); res.status(201).json({success:true,message:'Leave request submitted',data:leave});
};
async function decide(req,res,status) {
  const leave=await Leave.findById(req.params.id).populate('employee'); if(!leave)return res.status(404).json({success:false,message:'Leave request not found'}); if(leave.status!=='Pending')return res.status(409).json({success:false,message:'This leave request has already been decided'});
  const days=daysBetween(leave.startDate,leave.endDate); if(status==='Approved'){const key=balanceKey(leave.type);if(key&&key!=='unpaid'){if(leave.employee.leaveBalances[key]<days)return res.status(400).json({success:false,message:'Insufficient leave balance at approval time'});leave.employee.leaveBalances[key]-=days;await leave.employee.save();}}
  leave.status=status;leave.approvedBy=req.user._id;leave.decisionNote=req.body?.decisionNote||'';await leave.save(); const user=await User.findOne({employee:leave.employee._id});if(user)await createNotification({user:user._id,title:`Leave ${status.toLowerCase()}`,message:`Your ${leave.type.toLowerCase()} leave from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} was ${status.toLowerCase()}.`,type:status==='Approved'?'success':'danger'}); res.json({success:true,message:`Leave ${status.toLowerCase()}`,data:leave});
}
exports.approve=(req,res)=>decide(req,res,'Approved'); exports.reject=(req,res)=>decide(req,res,'Rejected');
