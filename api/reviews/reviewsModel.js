import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const ReviewsSchema = new Schema({
  author: {type: String},
  content: {type: String},
  created_at: {type: Date, default: Date.now},
  id: {type: String},
  update_at: {type: Date, default: Date.now},
  url: {type: String},
});


export default mongoose.model('Reviews', ReviewsSchema);