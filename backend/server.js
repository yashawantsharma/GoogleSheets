const express=require('express')
const mongoose=require('mongoose')

const app=express()

mongoose.connect(process.env.DataBase_URL)
.then(()=>{console.log("connection successfully")})
.catch((err)=>{console.log("connection filde",err)})

app.listen(process.env.PART)