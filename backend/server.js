require('dotenv').config();
const path=require('path');const express=require('express');const helmet=require('helmet');const cors=require('cors');const cookieParser=require('cookie-parser');const morgan=require('morgan');const connectDB=require('./config/db');const {notFound,errorHandler}=require('./middleware/errorHandler');
const app=express();const PORT=process.env.PORT||5000;
app.use(helmet({contentSecurityPolicy:false}));app.use(cors({origin:process.env.CLIENT_URL||`http://localhost:${PORT}`,credentials:true}));app.use(express.json({limit:'2mb'}));app.use(express.urlencoded({extended:true}));app.use(cookieParser());app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));
app.use('/api/auth',require('./routes/authRoutes'));app.use('/api/employees',require('./routes/employeeRoutes'));app.use('/api/departments',require('./routes/departmentRoutes'));app.use('/api/attendance',require('./routes/attendanceRoutes'));app.use('/api/leaves',require('./routes/leaveRoutes'));app.use('/api/payroll',require('./routes/payrollRoutes'));app.use('/api/notifications',require('./routes/notificationRoutes'));app.use('/api/dashboard',require('./routes/dashboardRoutes'));
app.get('/api/health',(req,res)=>res.json({success:true,message:'EMS API is running',timestamp:new Date().toISOString()}));
app.use(express.static(path.join(__dirname,'..','frontend')));
app.use((req,res,next)=>{if(req.path.startsWith('/api/'))return notFound(req,res);res.sendFile(path.join(__dirname,'..','frontend','index.html'));});
app.use(errorHandler);
connectDB().then(() => {
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`EMS running on http://localhost:${PORT}`);
        });
    }
}).catch(err => {
    console.error('Startup failed:', err.message);
});

module.exports = app;

