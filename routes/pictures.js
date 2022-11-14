import express from "express";
const router = express.Router();
import { authenticate } from "./auth.js";

import Picture from '../models/picture.js';
//multer pour envoyer form multi-data
import multer from "multer";
const upload = multer();
/* optionnal --> const upload = multer({ dest: 'uploads/' }) --> otherwise saved on memory */


router.get("/", function (req, res, next) {

    /* Pictures.find().sort('name').exec(function(err, pictures) {
        if (err) {
          return next(err);
        }
        res.send(pictures);
      }); */


    res.send("Got a response from the notes route and it works well");
});

//mettre npm multer et installer pour que cela fonctionne en renvoyant req.file
router.post('/', authenticate, upload.single('picture'), function (req, res, next) {
/*     const bufferImage = Buffer.from(req.file); */
    let item = {
        author: req.userId,
/*   place: JSON.parse(req.body.place),  */  // Une place existe avant la photo, l'user choisit dans l'app la place et nous on envoie son id en body
     picture : req.file.buffer  /* bufferImage */ 
    }

    let data = new Picture(item);

    //parser le json pour envoyer en form-data

    data.save(function (err, data) {
        if (err) {
            next(err)
            return;
        };
        res.send(data)
    });

})

export default router;

