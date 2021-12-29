import express from 'express';
import asyncHandler from 'express-async-handler';
import peopleModel from './peopleModel';

const router = express.Router(); 
//Get all people
router.get('/', asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query; 
    [page, limit] = [+page, +limit]; 

    const totalDocumentsPromise = peopleModel.estimatedDocumentCount(); 
    const peoplesPromise = peopleModel.find().limit(limit).skip((page - 1) * limit);

    const totalDocuments = await totalDocumentsPromise; 
    const peoples = await peoplesPromise;

    const returnObject = { page: page, total_pages: Math.ceil(totalDocuments / limit), total_results: totalDocuments, results: peoples };

    res.status(200).json(returnObject);
}));

//Get people details
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const people = await peopleModel.findByPeopleDBId(id);
    if (people) {
        res.status(200).json(people);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;