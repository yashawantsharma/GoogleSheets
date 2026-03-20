// const express=require('express')
// const mongoose=require('mongoose')
// require('dotenv').config();

// const app=express()
// app.use(express.json());
// mongoose.connect(process.env.DataBase_URL)
// .then(()=>{console.log("connection successfully")})
// .catch((err)=>{console.log("connection filde",err)})

// app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// const userRoute=require("./Router/userRouter");
// app.use("/user",userRoute);
// // const taskRoute=require("./Router/taskRouter");
// // app.use("/task",taskRoute);

// app.listen(process.env.PART,()=>{
//     console.log("server is running",process.env.PORT)
// })


const express=require('express');
const mongoose=require('mongoose');
const cors = require('cors')
require('dotenv').config();
const port=process.env.PORT;
const app=express();


// mongoose.connect(process.env.DataBase_URL)
// .then(()=>console.log("connected to database"))
// .catch((err)=>console.log("database is not connected",err));;;
mongoose.connect(process.env.DataBase_URL)
    .then(() => console.log("connection is successfully"))
    .catch((err) => console.log("database is not connected", err))

app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
// app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

const userRoute=require("./Router/userRouter");
app.use("/user",userRoute);
const taskRoute=require("./Router/taskRouter");
app.use("/task",taskRoute);



app.listen(port,()=>console.log("server is running on port",port))