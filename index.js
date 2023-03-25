const connectToMongo = require("./db")
const express = require("express")
connectToMongo()
var cors = require("cors")
const app = express()
const port = 1212

app.use(cors())
app.use(express.json())


//Available Routes.
app.use("/api/auth", require("./routes/auth"))
app.use("/api/notes", require("./routes/notes"))

app.get("/details", (req, res) => {
    res.send("Hello")
})


app.listen(process.env.PORT || port, () => {
    console.log(`iNoteBook Backend Alive on http://127.0.0.1:${port}`)
})
