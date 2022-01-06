import express from 'express';
import { movies, movieReviews, movieDetails } from './moviesData';
import uniqid from 'uniqid'
import reviewsModel from '../reviews/reviewsModel';
import recommendationsModel from '../recommendations/recommendationsModel';
import similarModel from '../similar/similarModel';
import movieModel from './movieModel';
import asyncHandler from 'express-async-handler';
import { getUpcomingMovies } from '../tmdb-api';
import { getNowplayingMovies } from '../tmdb-api';
import { getTopRatedMovies } from '../tmdb-api';
import { getMovieReviews } from '../tmdb-api';
import { getPopularMovies } from '../tmdb-api';
import { getMovieRecommendations } from '../tmdb-api';
import { getSimilarMoive } from '../tmdb-api';

const router = express.Router(); 
router.get('/', asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    const totalDocumentsPromise = movieModel.estimatedDocumentCount(); //Kick off async calls
    const moviesPromise = movieModel.find().limit(limit).skip((page - 1) * limit);

    const totalDocuments = await totalDocumentsPromise; //wait for the above promises to be fulfilled
    const movies = await moviesPromise;

    const returnObject = { page: page, total_pages: Math.ceil(totalDocuments / limit), total_results: totalDocuments, results: movies };//construct return Object and insert into response object

    res.status(200).json(returnObject);
}));

// Get movie details
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));
// Get movie reviews
// router.get('/:id/reviews', (req, res) => {
//     const id = parseInt(req.params.id);
//     // find reviews in list
//     if (movieReviews.id == id) {
//         res.status(200).json(movieReviews);
//     } else {
//         res.status(404).json({
//             message: 'The resource you requested could not be found.',
//             status_code: 404
//         });
//     }
// });

//get movie reviews
router.get('/:id/reviews', async (req, res, next) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id)
    if (movie) {
        const reviews = movie.reviews
        if (reviews.length) {
            console.log('load from the database');
            movieModel.findByMovieDBId(id).populate('reviews')
                .exec((err, foundObject) => {
                    if (err) {
                        next(err)
                    }
                    res.status(200).send(foundObject.reviews)
                })
        }
        else {
            console.log('load from TMDB and store');
            const reviews = await getMovieReviews(id);
            await reviewsModel.deleteMany();
            await reviewsModel.collection.insertMany(reviews);
            const review_ids = await reviewsModel.find({}, { _id: 1 })
            review_ids.forEach(async review_id => {
                await movie.reviews.push(review_id)
            })
            await movie.save()
            res.status(200).json(reviews);
        }
    }
    else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
});

// //Post a movie review
// router.post('/:id/reviews', (req, res) => {
//     const id = parseInt(req.params.id);

//     if (movieReviews.id == id) {
//         req.body.created_at = new Date();
//         req.body.updated_at = new Date();
//         req.body.id = uniqid();
//         movieReviews.results.push(req.body); //push the new review onto the list
//         res.status(201).json(req.body);
//     } else {
//         res.status(404).json({
//             message: 'The resource you requested could not be found.',
//             status_code: 404
//         });
//     }
// });

//Post a movie review
router.post('/:id/reviews', asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);

    if (movie) {
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        req.body.id = uniqid();

        if (!req.body.author || !req.body.content) {
            res.status(401).json({ success: false, msg: 'Please pass author and content.' });
            return next();
        } else {
            var reg = /^(a-z|A-Z|0-9)*[^$%^&*;:,<>?()\""\']{10,}$/;
            if (reg.test(req.body.content)) {
                await reviewsModel.collection.insertOne(req.body);
                await movie.reviews.push(req.body)
                await movie.save();
                res.status(201).json({ code: 201, msg: 'Successful created new review.' });
            } else {
                res.status(401).json({ success: false, msg: 'This is not a good review format.' });
            }
        }
    } else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
}));


router.get('/tmdb/upcoming', asyncHandler( async(req, res) => {
    const upcomingMovies = await getUpcomingMovies();
    res.status(200).json(upcomingMovies);
}));

router.get('/tmdb/nowplaying', asyncHandler( async(req, res) => {
    const nowplayingMovies = await getNowplayingMovies();
    res.status(200).json(nowplayingMovies);
}));

router.get('/tmdb/topRated', asyncHandler( async(req, res) => {
    const topRatedMovies = await getTopRatedMovies();
    res.status(200).json(topRatedMovies);
}));


router.get('/tmdb/popular', asyncHandler( async(req, res) => {
    const popularMovies = await getPopularMovies();
    res.status(200).json(popularMovies);
}));

router.get('/:id/recommendations', async (req, res, next) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id)
    if (movie) {
        const recommendations = movie.recommendations
        if (recommendations.length) {
            console.log('load from the database');
            movieModel.findByMovieDBId(id).populate('recommendations')
                .exec((err, foundObject) => {
                    if (err) {
                        next(err)
                    }
                    res.status(200).send(foundObject.recommendations)
                })
        }
        else {
            console.log('load from TMDB and store');
            const recommendations = await getMovieRecommendations(id);
            await recommendationsModel.deleteMany();
            await recommendationsModel.collection.insertMany(recommendations);
            const recommendation_ids = await recommendationsModel.find({}, { _id: 1 })
            recommendation_ids.forEach(async recommendation_id => {
                await movie.recommendations.push(recommendation_id)
            })
            await movie.save()
            res.status(200).json(recommendations);
        }
    }
    else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
});

router.get('/:id/similar', async (req, res, next) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id)
    if (movie) {
        const similar = movie.similar
        if (similar.length) {
            console.log('load from the database');
            movieModel.findByMovieDBId(id).populate('similar')
                .exec((err, foundObject) => {
                    if (err) {
                        next(err)
                    }
                    res.status(200).send(foundObject.similar)
                })
        }
        else {
            console.log('load from TMDB and store');
            const similar = await getSimilarMoive(id);
            await similarModel.deleteMany();
            await similarModel.collection.insertMany(similar);
            const similar_ids = await similarModel.find({}, { _id: 1 })
            similar_ids.forEach(async similar_id => {
                await movie.similar.push(similar_id)
            })
            await movie.save()
            res.status(200).json(similar);
        }
    }
    else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
});













export default router;