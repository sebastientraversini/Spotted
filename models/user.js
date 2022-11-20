import mongoose from 'mongoose';
import notes from './note.js';

import pictures from './picture.js';


const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validateWord,
      message: 'Format incorrect. Please use minimal 3 letters and use only letters'
    }
  },
  surname: {
    type: String,
    required: true,
    validate: {
      validator: validateWord,
      message: 'Format incorrect. Please use minimal 3 letters and use only letters'
    }
  }, pictures: [{
    type: Schema.Types.ObjectId,
    ref: 'Picture'
  }],
  notes: [{
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }],
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

function validateWord(value) {
  let isOk = /^[a-zA-Z]{3,}$/.test(value);
  return isOk;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);