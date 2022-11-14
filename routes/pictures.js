import express from "express";
const router = express.Router();
import { authenticate } from "./auth.js";
import Pictures from '../models/picture.js';

/**
 * @api {get} /pictures/:id Request a picture's information
 *  
 * @apiName GetPicture
 * @apiGroup Picture
 *
 * @apiParam {Number} id Picture id 
*/

router.get("/", function (req, res, next) {

    /* Pictures.find().sort('name').exec(function(err, pictures) {
        if (err) {
          return next(err);
        }
        res.send(pictures);
      }); */

  res.send("Got a response from the notes route and it works well");
});

/**
 * @api {post} /pictures/:id add Picture
 *  
 * @apiName AddPicture
 * @apiGroup Picture
 *
 * @apiParam {Number} id Picture id 
*/

router.post('/post', authenticate, function (req, res, next){
    let item = {
  author: idUser,
  place: req.body.place
      
    }
    let data = new Picture(item);   
  
    data.save();
    res.redirect('/')
  })

export default router;
