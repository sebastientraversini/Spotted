import mongoose from 'mongoose';
import pictures from './picture.js';
import notes from './note.js';
import users from './user.js';


const Schema = mongoose.Schema;
// Define the schema for places


const placeSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validateWord,
      message: '{VALUE} is not a valid word. Use minimal 3 letters and use only letters'
    }
  },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required:true},


  canton: {
    type: String,
    required: true,
    validate: {
      validator: validateCanton,
      message: '{VALUE} is not a valid word. Use minimal 3 letters and use only letters, accent or tiret'
    }
  },
  location: {
    type: {
      type: String,
      required: true,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: validateGeoJsonCoordinates,
        message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
      }
    }
  },
  pictures: [{ type: Schema.Types.ObjectId, ref: 'Picture' }],
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  tags: [{ type: String, required: true }]

}, { collection: 'user-places' });



// Create a geospatial index on the location property.
placeSchema.index({ location: '2dsphere' });

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
  return value >= -90 && value <= 90;
}

function isLongitude(value) {
  return value >= -180 && value <= 180;
}

function validateWord(value) {
  let isOk = /^[a-zA-Z]{3,}$/.test(value);
  return isOk;
}

function validateCanton(value) {
/*   let isOk = /^[a-zA-Z]{3,}$/.test(value); */
  let isOk = /^[a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ._\s-]{3,40}$/.test(value);
  return isOk;
}

export default mongoose.model('Place', placeSchema);