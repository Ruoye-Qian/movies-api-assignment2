import userModel from '../api/users/userModel';
import users from './users';
import genresModel from '../api/genres/genresModel';
//import genres from './genres';
import movieModel from '../api/movies/movieModel';
//import movies from './movies.js';
import peopleModel from '../api/people/peopleModel';
//import peoples from './people.js';
import tvModel from '../api/tv/tvModel';
//import tvs from './tv.js';
import dotenv from 'dotenv';

const {getMovies, getGenres, getPeoples, getTvs} = require('../api/tmdb-api')


dotenv.config();
// deletes all movies documents in collection and inserts test data
export async function loadMovies() {
  console.log('load seed data');
  //console.log(movies.length);
  try {
    await movieModel.deleteMany();
    const movies = await getMovies();
    await movieModel.collection.insertMany(movies);
    console.info(`${movies.length} Movies were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load movie Data: ${err}`);
  }
}

// deletes all user documents in collection and inserts test data
async function loadUsers() {
  console.log('load user Data');
  try {
    await userModel.deleteMany();
    await users.forEach(user => userModel.create(user));
    console.info(`${users.length} users were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load user Data: ${err}`);
  }
}

async function loadGenres() {
  console.log('load genres Data');
  try {
    await genresModel.deleteMany();
    const genres = await getGenres();
    await genresModel.collection.insertMany(genres);
    console.info(`${genres.length} genres were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load genres Data: ${err}`);
  }
}

export async function loadPeople() {
  console.log('load actor data');
  //console.log(peoples.length);
  try {
    await peopleModel.deleteMany();
    const peoples = await getPeoples();
    await peopleModel.collection.insertMany(peoples);
    console.info(`${peoples.length} people were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load people Data: ${err}`);
  }
}

export async function loadTv() {
  console.log('load tv data');
  //console.log(tvs.length);
  try {
    await tvModel.deleteMany();
    const tvs = await getTvs();
    await tvModel.collection.insertMany(tvs);
    console.info(`${tvs.length} tvs were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load tv Data: ${err}`);
  }
}

if (process.env.SEED_DB == 'true') {
  loadUsers();
  loadGenres();//you may not need this line if you skipped the exercises
  loadMovies();//ADD THIS LINE
  loadPeople();
  loadTv();
}
