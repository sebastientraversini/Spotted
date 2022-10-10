import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the users route");
});

router.get("/:id", function (req, res, next) {
  if(req.params.id !== "1234") {
    throw new Error("User does not exist")
    return
  }
  res.send({
    "id" : req.params.id,
    "nom": "ta mère"
  });
});

export default router;
