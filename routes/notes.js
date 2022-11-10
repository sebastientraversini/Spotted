import express from "express";
import Note from '../models/note.js';

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("wallah ça fonctionne");
});
/* router.get("/hello", function (req, res, next) {
    res.send("hello");
  }); */

  router.post('/insert',function (req, res, next){
    let item = {
      note:req.body.note,
      text:req.body.text
    }
    let data = new UserData(item);
    data.save();
    res.redirect('/')
  })


 

  



  

export default router;
