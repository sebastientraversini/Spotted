import express from "express";
const router = express.Router();
import { authenticate } from "./auth.js";

import Picture from '../models/picture.js';
//multer pour envoyer form multi-data
import multer from "multer";
const upload = multer();
/* optionnal --> const upload = multer({ dest: 'uploads/' }) --> otherwise saved on memory */
import User from "../models/user.js"


router.get("/", function (req, res, next) {

    Picture.find().sort('name').exec(function(err, pictures) {
        if (err) {
          return next(err);
        }
        res.send(pictures);
      }); 
});

//mettre npm multer et installer pour que cela fonctionne en renvoyant req.file

//poster une photo
router.post('/', authenticate, upload.single('picture'), function (req, res, next) {
    /*     const bufferImage = Buffer.from(req.file); */
    let item = {
        author: req.userId,
        place: req.body.place,    // Une place existe avant la photo, l'user choisit dans l'app la place et nous on envoie son id en body
        picture: req.file.buffer  /* bufferImage */
    }

    let data = new Picture(item);


    data.save(function (err, data) {
        if (err) {
            next(err)
            return;
        };

        res.send(data)
    });

})

export default router;


/**
 * @api {get} /pictures/:id Request a picture's information
 *  
 * @apiName GetPicture
 * @apiGroup Picture
 *
 * @apiParam {Number} id Picture id 
 *
 * @apiSuccess {String} author picture author
 * @apiSuccess {String} place  picture place
 * @apiSuccess {String} picture picture picture
 * 
 * 
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "auhor": "aefj4clcro5jd3",
 *       "place": "Chateau de Chillon",
 *       "picture": "[1,2,3]"
 * 
 * }
 *     
 * 
 */


/* router.get("/hello", function (req, res, next) {
    res.send("hello");
  }); */

  
  /**
 * @api {post} /notes/ add a Note
 *  @apiPermission seulement un user connecté
 * @apiName Add a Note
 * @apiGroup Note
 * 
 * @apiParam {Objects[]} [pictures] User pictures
 * @apiParam {Strings[]} notes User notes
 * @apiParam {Strings[]} [tags] User tags
 * @apiParam {String} [text] Note text
 * 
 * @apiParamExample Example Body:
 *    {
 * "notes": "{
 *       stars : 3,
 *      text: tréjoli
 *  }",
 * "tags": "{chateau,
 *         Lac}"
 * }
 * 
 * @apiSuccess {Objects[]} [pictures] User pictures
 * @apiSuccess {Strings[]} notes User notes
 * @apiSuccess {Strings[]} [tags] User tags
 * @apiSuccess {String} [text] Note text
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre note à été créé !"
 *     }
 */