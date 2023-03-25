const mongoose = require("mongoose")
//mongodb+srv://joypradhan:SnLbw6q-p9dF6KS@cluster0.eqnuobf.mongodb.net/Joxicweb?retryWrites=true&w=majority
const mongouri = "mongodb+srv://joypradhan:SnLbw6q-p9dF6KS@cluster0.eqnuobf.mongodb.net/mernApp?retryWrites=true&w=majority"

const connectToMongo = ()=>{
    mongoose.connect(mongouri).then(()=>{
        console.log("connected")
    })
}

module.exports = connectToMongo