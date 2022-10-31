import mongoose from 'mongoose';
import places from "./place.js"

const Schema = mongoose.Schema;
// Define the schema for pictures


const pictureSchema = new Schema({

author: { type: Schema.Types.ObjectId, ref: 'user' },
place: { type: Schema.Types.ObjectId, ref: 'place' },   

},{collection:'user-pictures'});

export default mongoose.model('Picture', pictureSchema);