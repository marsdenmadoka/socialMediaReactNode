const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
//mongodb+srv://marsden:madoka98@cluster0.ewzaf.mongodb.net/SocialMediaApp?retryWrites=true&w=majority
const connectDB = async () =>{
 try {
    await mongoose.connect(db,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true
    })  
    console.log('mongo connected')  
 } catch (err) {
    console.error(err.message)
    //exit process with failure 
    process.exit(1)
 }
}

module.exports = connectDB