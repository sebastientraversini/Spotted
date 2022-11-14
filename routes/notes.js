import express from "express";
import Note from '../models/note.js';
import place from "../models/place.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/",authenticate, function (req, res, next) {
  res.send("wallah ça fonctionne");
});
/* router.get("/hello", function (req, res, next) {
    res.send("hello");
  }); */

  router.post('/',authenticate,function (req, res, next){

    let item = {
      author: req.userId,
      stars:req.body.stars,
      text:req.body.text,
      place: req.body.place
    }
    let data = new Note(item);

    data.save(function(err, savedNote) {
      if (err) {
        next(err);
      }
      else {
        res.send(savedNote);
      }
    });
  })


export default router;
