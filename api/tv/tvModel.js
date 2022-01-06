import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const TvSchema = new Schema({
  //adult: { type: Boolean },
  id: { type: Number, required: true, unique: false },
  poster_path: { type: String },
  overview: { type: String },
  genre_ids: [{ type: Number }],
  original_language: { type: String },
  backdrop_path: { type: String },
  popularity: { type: Number },
  vote_count: { type: Number },
  vote_average: { type: Number },
  first_air_date: { type: String },
  name: { type: String },
  original_name:{ type: String },
  cast: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cast'
  }, {collection: 'cast'}]
});

TvSchema.statics.findByTvDBId = function (id) {
  return this.findOne({ id: id });
};

export default mongoose.model('Tvs', TvSchema);






