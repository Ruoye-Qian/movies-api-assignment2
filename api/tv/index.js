import express from 'express';
import tvModel from './tvModel';
import asyncHandler from 'express-async-handler';

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

export default router;