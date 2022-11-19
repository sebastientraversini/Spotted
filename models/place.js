import mongoose from 'mongoose';
import pictures from './picture.js';
import notes from './note.js';


const Schema = mongoose.Schema;
// Define the schema for places


const placeSchema = new Schema({
  name: { type : String,
  required : true
},


    canton: {type: String,
    required:true},
    location: {
        type: {
          type: String,
          required: true,
          enum: [ 'Point' ]
        },
        coordinates: {
          type: [ Number ],
          required: true,
          validate: {
            validator: validateGeoJsonCoordinates,
            message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
          }
        }
      },
    pictures: [{ type: Schema.Types.ObjectId, ref: 'pictures' }],
    notes : [{ type: Schema.Types.ObjectId, ref: 'notes' }],
    tags : [{type :String, required: true}]

},{collection:'user-places'});



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
export default mongoose.model('Place', placeSchema);