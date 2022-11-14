import mongoose from 'mongoose';
import places from "./place.js"
import users from "./user.js"

const Schema = mongoose.Schema;
// Define the schema for pictures


const pictureSchema = new Schema({

author: { type: Schema.Types.ObjectId, ref: 'User' },

/*  place: { type: Schema.Types.ObjectId, ref: 'Place' },  */
picture: {type : Buffer, required: true}    


});

export default mongoose.model('Picture', pictureSchema);