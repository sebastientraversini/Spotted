import express from "express";
import Note from '../models/note.js';

import place from "../models/place.js";
import { authenticate } from "./auth.js";


const router = express.Router();



router.get("/", function (req, res, next) {
  Note.find().exec(function (err, users) {
    if (err) {
      return next(err);
    }

    res.send(users);
  });
});

function getNoteId(req, res, next) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    //avec populate pour avoir toutes les infos de la place liée à la note
    Note.findById(req.params.id).populate("place").exec(function (err, note) {
      if (err) {
        return next(err);
      } else if (!note) {
        return res.status(404).send("No note with this id")
      }
      req.note = note;
      next();
    });
  } else {
    return res.status(404).send("No note with this id")
  }
}

router.get("/:id", getNoteId, function (req, res, next) {
res.send(req.note)
});
 
//modifier une note qu'on a créé
   router.patch('/:id', getNoteId, authenticate, function (req, res, next) {

    Note.findById(req.note._id, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(docs.author, req.userId)
  
        if (!docs.author.equals(req.userId)) {
          return res.status('403').send("You can only delete notes you created")
        }
  
        //update la note
        Note.findOneAndUpdate(
          { _id: req.note._id },
          {
            stars: req.body.stars,
            text: req.body.text
          },
           function (err, user) {
          if (err) {
            next(err);
            return;
          }
          console.log(user)
          res.send("You updated your note, congrats !")
        })
      }
    });
  
  }) 

export default router;




/**
 * @api {get} /notes/:id Request a note's information
 *  
 * @apiName GetNote
 * @apiGroup Note
 *
 * @apiParam {Number} id Note id 
 *
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} lastName  User surname
 * @apiSuccess {String} name Place name
 * @apiSuccess {String} canton  Place canton
 * @apiSuccess {Objects[]} location  Place location
 * @apiSuccess {Strings[]} pictures Place pictures
 * @apiSuccess {Strings[]} notes Place notes
 * @apiSuccess {String[]} tags Place tags
 * @apiSuccess {Objects[]} notes  Note notes
 * @apiSuccess {String} text  Note text
 * 
 * 
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "Florian",
 *       "lastname": "Quadri",
 *       "name": "Chateau de Chillon",
 *      "canton": "Vaud",
 *     "location": "{
 *      1,
 *     2,
 *    3
 *    }",
 * "pictures": "{
 *    1,
 *   2,
 *  3
 * }",
 * "notes": "{
 *        stars : 3,
 *        text: tréjoli,
 *          }",
 * "tags": "{
 * 1,
 * 2,
 * 3
 * }",
 * "notes": "{
 *        stars : 3,
 *        text: tréjoli,
 *          }",
 * "text": "s234jdsl31osaweak23o",
 *    }
 * 
 */


/* router.get("/hello", function (req, res, next) {
    res.send("hello");
  }); */

  



  /**
 * @api {post} /notes/ add Note
 *  
 * @apiName AddNote
 * @apiGroup Note
 * 
 * @apiParam {Objects[]} pictures User pictures, not mandatory
 * @apiParam {Strings[]} notes User notes, mandatory
 * @apiParam {Strings[]} tags User tags, not mandatory
 * @apiParam {String} text Note text, not mandatory
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
 * @apiSuccess {Objects[]} pictures User pictures, not mandatory
 * @apiSuccess {Strings[]} notes User notes, mandatory
 * @apiSuccess {Strings[]} tags User tags, not mandatory
 * @apiSuccess {String} text Note text, not mandatory
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre note à été créé !"
 *     }
 */
