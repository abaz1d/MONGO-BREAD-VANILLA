var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = function (db) {
  const collection = db.collection('users');

  //GET, READ USERS
  router.get('/', async function (req, res, next) {
    try {
      const findResult = await collection.find({}).toArray();
      res.status(200).json(findResult)
    } catch (e) {
      res.json(e)
    }
  });

  //POST, CREATE USERS
  router.post('/', async function (req, res, next) {
    try {
      const insertResult = await collection.insertOne({ string: req.body.string, integer: req.body.integer, float: req.body.float, date: req.body.date, boolean: req.body.boolean });
      res.status(201).json(insertResult)
    } catch (e) {
      res.json(e)
    }
  });

  //PUT, EDIT USERS
  router.put('/:id', async function (req, res, next) {
    try {
      const updateResult = await collection.updateOne({ _id: ObjectId(req.params.id) }, { $set: { string: req.body.string, integer: req.body.integer, float: req.body.float, date: req.body.date, boolean: req.body.boolean } });
      res.status(201).json(updateResult)
    } catch (e) {
      res.json(e)
    }
  });

  //DELETE, USSER DELETE
  router.delete('/:id', async function (req, res, next) {
    try {
      const deleteResult = await collection.deleteOne({ _id: ObjectId(req.params.id) });
      res.status(201).json(deleteResult)
    } catch (e) {
      res.json(e)
    }
  });

  return router;
}