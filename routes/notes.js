import express from "express";
import Note from '../models/note.js';
import { authenticate } from "./auth.js";

const router = express.Router();

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

router.get("/",authenticate, function (req, res, next) {
  res.send("wallah ça fonctionne");
});
/* router.get("/hello", function (req, res, next) {
    res.send("hello");
  }); */



  /**
 * @api {post} /notes/:id add Note
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
