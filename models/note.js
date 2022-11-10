import mongoose from 'mongoose';
import users from './user.js';

const Schema = mongoose.Schema;
// Define the schema for notes
const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    });
// Create the model from the schema and export it



export default mongoose.model('Note', noteSchema);