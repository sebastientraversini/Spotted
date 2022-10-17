import express from "express";
import User from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as config from "../config.js"
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
  User.find().sort('name').exec(function(err, users) {
    if (err) {
      return next(err);
    }

    res.send(users);
  });
});

router.post("/", function(req, res, next) {
  //on récupère le password envoyé dans la requête
  const plainPassword = req.body.password;
  const costFactor = 10;
  //on hash le password + le sable
  bcrypt.hash(plainPassword, costFactor, function(err, hashedPassword) {
    if (err) {
      return next(err);
    }
      // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    //on rentre le password hashé comme nouveau mdp de l'user
    newUser.passwordHash = hashedPassword;
      // Save that document
    newUser.save(function(err, savedUser) {
      if (err) {
        return next(err);
      }
      res.send(savedUser);
    });
  });
});

/* router.get("/:id", function (req, res, next) {
  if(req.params.id !== "1234") {
    throw new Error("User does not exist")
    return
  }
  res.send({
    "id" : req.params.id,
    "nom": "ta mère"
  });
}); */

export default router;
