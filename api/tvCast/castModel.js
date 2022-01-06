import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const CastSchema = new Schema({
  adult: {type: Boolean},
  gender: {type: Number},
  id: {type: Number},
  known_for_department: {type: String},
  name: {type: String},
  original_name: {type: String},
  popularity: {type: Number},
  profile_path: {type: String},
  character: {type: String},
  credit_id: {type: String},
  order: {type: Number},

});


export default mongoose.model('Cast', CastSchema);