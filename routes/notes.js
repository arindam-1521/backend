const express = require("express")
const router = express.Router()
const fetchuser = require("../middleware/fetchuser")
const Notes = require("../models/Notes")
const { body, validationResult } = require("express-validator")

//! Route-1 : Get All the Notes using GET request to "/api/notes"
router.post("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)
        // res.send("You Noob")
    } catch (errors) {
        res.status(500).json({ errors: errors.array() });
    }
})


//? Route-2 : Add a new Note using GET request to "/api/notes/addnote" Login required.
router.post("/addnote", fetchuser, [body('title', "Title too small.").isLength({ min: 3 }), body('description', "Too Short Description").isLength({ min: 3 })], async (req, res) => {

    try {
        const { title, description, tag } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save()
        res.json(savedNote)
    } catch (errors) {
        res.status(500).json({ errors: errors.array() });
    }

})

//* Route-3 : Update a Note using PUT request to "/api/notes/updatenote" Login required.

router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    //Create a new Note Object
    const newNote = {}
    if (title) {
        newNote.title = title;
    }
    if (description) {
        newNote.description = description;
    }
    if (tag) {
        newNote.tag = tag;
    }
    //find the note to be updatad.

    let note = await Notes.findById(req.params.id);

    if (!note) {
        res.status(404).send("Note Not Found.")
    }

    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed.")
    }

    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.json({ note })

})



//! Route-4: Delete a Note using delete request to "/api/notes/deletenote" Login required.

router.delete("/deletenote/:id", fetchuser, async (req, res) => {

    //find the note to be updatad.

    try {
        let note = await Notes.findById(req.params.id);

        if (!note) {
            res.status(404).send("Note Not Found.")
        }

        //Allow Deletion only if the user owns this note

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed.")
        }


        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note is Deleted" })
    } catch (error) {
        res.status(404).json({ "error": "Something Wrong happened." })
    }


})




module.exports = router