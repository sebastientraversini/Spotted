import express from "express";
import Note from '../models/note.js';

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the notes route and it works well");
});
router.get("/hello", function (req, res, next) {
    res.send("hello");
  });

  router.post('/insert',function (req, res, next){
    let item = {
      title:req.body.title,
      content:req.body.content,
      author:req.body.author
    }
    let data = new UserData(item);
    data.save();
    res.redirect('/')
  })

export default router;
