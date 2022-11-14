import mongoose from 'mongoose';
import notes from './note.js';
import pictures from './picture.js';

const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  }, pictures: [{
    type: Schema.Types.ObjectId,
    ref: 'Picture'
  }],
  notes: [{
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }],
  /* fonction d'aggrégation pour --> visitedPlaces: {
    type: Array,
    required: true
  }, */
  passwordHash: {
    type: String,
    required: true
  }
});

//permet de cacher le champ password à l'utilisateur en retour
userSchema.set("toJSON", {
  transform: transformJsonUser
});
function transformJsonUser(doc, json, options) {
  // Remove the hashed password from the generated JSON.
  delete json.passwordHash;
  return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);