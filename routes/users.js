import express from "express";
import User from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as config from "../config.js"
import { authenticate } from "./auth.js";


const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
  User.find().sort('name').exec(function (err, users) {
    if (err) {
      return next(err);
    }

    res.send(users);
  });
});



router.post("/", function (req, res, next) {
  //on récupère le password envoyé dans la requête
  const plainPassword = req.body.password;
  const costFactor = 10;
  //on hash le password + le sable
  bcrypt.hash(plainPassword, costFactor, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }
    // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    //on rentre le password hashé comme nouveau mdp de l'user
    newUser.passwordHash = hashedPassword;
    // Save that document
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }
      res.send(savedUser);
    });
  });
});

function getUserId(req, res, next) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    User.findById(req.params.id).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return res.status(404).send("Pas d'utilisateur avec cet id, cherche mieux")
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(404).send("Pas d'utilisateur avec cet id, cherche mieux")
  }
}


//chercher by id
router.get("/:id", getUserId, function (req, res, next) {
  //si c'est un objectId valide
/* .populate pour avoir toutes les infos */
  res.send(req.user);

});


//chercher photos d'un user
router.get("/:id/pictures", getUserId, function (req, res, next) {
  if (req.user.pictures.length == 0) {
    res.send("pas de photo pour cet user");
  }

  req.user.populate("pictures", function(err){
    //renvoyer un tableau d'objets photo --> populate permet d'éviter de recevoir juste l'id de la photo, mais tout l'objet
    res.send(req.user.pictures);
    })

});

//chercher notes d'un user
router.get("/:id/notes", getUserId, function (req, res, next) {
  if (req.user.pictures.length == 0) {
    res.send("pas de notes pour cet user");

  }

  req.user.populate("notes", function(err){
    //renvoyer un tableau d'objets photo --> populate permet d'éviter de recevoir juste l'id de la photo, mais tout l'objet
    res.send(req.user.notes);
    })

});

//chercher places visitées d'un user
router.get("/:id/places", getUserId, function (req, res, next) {

  if (req.user.visitedPlaces.length == 0) {
    res.send("Cet user n'a visité aucune place");
  }
  req.user.populate(
    {
    path : "notes",
    populate : {path : "place"}
  }, function(err){
    let arrayPlaces = [];
    //renvoyer un tableau d'objets photo --> populate permet d'éviter de recevoir juste l'id de la photo, mais tout l'objet
    req.user.notes.forEach((n)=>{
      arrayPlaces.push(n.place);
    })
    res.send(arrayPlaces);
    })
});



/**
 * @api {get} /users/:id Request a user's information
 *  
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id User id 
 *
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} lastName  User surname
 * @apiSuccess {Objects[]} pictures  User pictures
 * @apiSuccess {Strings[]} notes  User notes
 * @apiSuccess {String} passwordHash  User passwordHash
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "Florian",
 *       "lastname": "Quadri",
 *        "pictures": "{
 *        1,
 *        2,
 *        3
 *        }",
 * "notes": "{
 *        1,
 *        2,
 *        3
 *          }",
 * "passwordHash": "s234jdsl31osaweak23o",
 *     }
 */

/**
 * @api {post} /users/:id add User
 *  
 * @apiName AddUser
 * @apiGroup User
 * 
 * @apiParam {String} firstname User firstname, mandatory
 * @apiParam {String} surname User surname, mandatory
 * @apiParam {String} password User password, mandatory
 * @apiParam {Objects[]} pictures  User pictures, not mandatory
 * @apiParam {Strings[]} notes  User notes, not mandatory
 * 
 * 
 * @apiParamExample Example Body:
 *    {
 *     "firstname": "Florian",
 *    "surname": "Quadri",
 *   "password": "123456"
 *   } 
 * 
 * 
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} surname  User surname
 * @apiSuccess {String} password  User password
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre user à été créé !"
 *       
 *     }
 */
