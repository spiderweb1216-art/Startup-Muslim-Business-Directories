const path=require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const morgan=require('morgan');
const {testConnection,database}=require('./config/db');
const {reconcileApprovedClaims,ensureStartupContacts}=require('./services/recordService');
const authRoutes=require('./routes/auth');
const dataRoutes=require('./routes/data');
const publicRoutes=require('./routes/public');
const savedRoutes=require('./routes/saved');
const adminRoutes=require('./routes/admin');

const app=express();
const port=Number(process.env.API_PORT||5000);
const origins=String(process.env.CLIENT_URL||'http://localhost:3000').split(',').map(x=>x.trim());
app.use(helmet({crossOriginResourcePolicy:false}));
app.use(cors({origin:(origin,cb)=>!origin||origins.includes(origin)?cb(null,true):cb(new Error('Origin not allowed by CORS')),credentials:true}));
app.use(express.json({limit:process.env.JSON_LIMIT||'20mb'}));
app.use(express.urlencoded({extended:true,limit:process.env.JSON_LIMIT||'20mb'}));
app.use(morgan('dev'));

app.get('/api/health',async(_req,res)=>{try{await testConnection();res.json({status:'ok',database,serverTime:new Date().toISOString()});}catch(error){res.status(503).json({status:'error',database,message:error.message});}});
app.use('/api/auth',authRoutes);
app.use('/api',dataRoutes);
app.use('/api',publicRoutes);
app.use('/api/saved',savedRoutes);
app.use('/api/admin',adminRoutes);

app.use((req,res)=>res.status(404).json({message:`API route not found: ${req.method} ${req.path}`}));
app.use((error,_req,res,_next)=>{
  console.error(error);
  if(error.code==='ER_DUP_ENTRY')return res.status(409).json({message:'A record with the same unique value already exists.'});
  if(error.code==='ER_NO_SUCH_TABLE'||error.code==='ER_BAD_DB_ERROR')return res.status(503).json({message:'The MySQL database is not initialized. Run npm run db:setup.'});
  res.status(error.status||500).json({message:error.message||'An unexpected server error occurred.'});
});

async function startServer(){
  try{
    await testConnection();
    const repaired=await reconcileApprovedClaims();
    if(repaired)console.log(`Repaired ownership for ${repaired} approved claim(s).`);
    const contactsAdded=await ensureStartupContacts();
    if(contactsAdded)console.log(`Added default public contact profiles to ${contactsAdded} company record(s).`);
  }catch(error){
    console.warn(`Database startup check: ${error.message}`);
  }
  app.listen(port,()=>console.log(`Crescent API running at http://localhost:${port}/api (database: ${database})`));
}

startServer();
