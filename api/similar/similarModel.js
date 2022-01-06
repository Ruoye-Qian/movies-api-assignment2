import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const SimilarSchema = new Schema({
  poster_path: {type: String},
  adult: {type: Boolean},
  overview: {type: String},
  release_date: {type: String},
  genre_ids: {type: Number},
  id: {type: Number},
  original_title: {type: String},
  original_language: {type: String},
  title: {type: String},
  backdrop_path: {type: String},
  popularity: {type: Number},
  vote_count: {type: Number},
  video: {type: Boolean},
  vote_average: {type: Number},
});


export default mongoose.model('Similar', SimilarSchema);