import express from 'express';
import tvModel from './tvModel';
import asyncHandler from 'express-async-handler';
import castModel from '../tvCast/castModel';
import { getTvCast } from '../tmdb-api';


const router = express.Router(); 
//get tvs
router.get('/', asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query; 
    [page, limit] = [+page, +limit]; 

    const totalDocumentsPromise = tvModel.estimatedDocumentCount(); 
    const tvsPromise = tvModel.find().limit(limit).skip((page - 1) * limit);

    const totalDocuments = await totalDocumentsPromise; 
    const tvs = await tvsPromise;

    const returnObject = { page: page, total_pages: Math.ceil(totalDocuments / limit), total_results: totalDocuments, results: tvs };

    res.status(200).json(returnObject);
}));

// Get tv details
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const tv = await tvModel.findByTvDBId(id);
    if (tv) {
        res.status(200).json(tv);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

router.get('/:id/cast', async (req, res, next) => {
    const id = parseInt(req.params.id);
    const tv = await tvModel.findByTvDBId(id)
    if (tv) {
        const cast = tv.cast
        if (cast.length) {
            console.log('load from the database');
            tvModel.findByTvDBId(id).populate('cast')
                .exec((err, foundObject) => {
                    if (err) {
                        next(err)
                    }
                    res.status(200).send(foundObject.cast)
                })
        }
        else {
            console.log('load from TMDB and store');
            const cast = await getTvCast(id);
            await castModel.deleteMany();
            await castModel.collection.insertMany(cast);
            const cast_ids = await castModel.find({}, { _id: 1 })
            cast_ids.forEach(async cast_id => {
                await tv.cast.push(cast_id)
            })
            await tv.save()
            res.status(200).json(cast);
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