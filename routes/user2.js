var express = require('express');
var router = express.Router();
const mongodb = require('mongodb')

module.exports = function (db) {
  router.get('/', async function (req, res, next) {
    const limit = req.query.display
    const page = req.query.page || 1

    const offset = limit == 'all' ? 0 : (page - 1) * limit
    const wheres = []

    var sortBy = req.query.sortBy == undefined ? 'id' : req.query.sortBy;
    var order = req.query.order == undefined ? 1 : req.query.order;
    var sortMongo = `{"${sortBy}" : ${order}}`;
    sortMongo = JSON.parse(sortMongo);
    console.log(sortBy, order, sortMongo)

    if (req.query.id) {
      wheres.push(`"id" : ${req.query.id}`);
    }

    if (req.query.integer) {
      wheres.push(`"integer" : ${req.query.integer}`);
    }

    if (req.query.float) {
      wheres.push(`"float" : ${req.query.float}`);
    }

    if (req.query.startDate != '' && req.query.endDate != '') {
      wheres.push(`"date" :{ "$gt": "${req.query.startDate}", "$lte": "${req.query.endDate}"}`)
    }
    else if (req.query.startDate) {
      wheres.push(`"date": {"$gt": "${req.query.startDate}"}`)
    }
    else if (req.query.endDate) {
      wheres.push(`"date": {"$lte": "${req.query.endDate}"}`)
    }

    if (req.query.boolean) {
      wheres.push(`"boolean" : ${req.query.boolean}`);
    }


    let noSql = '{';
    if (wheres.length > 0) {
      noSql += `${wheres.join(',')}`
    }
    noSql += '}'

    noSql = JSON.parse(noSql)
    if (req.query.string) {
      noSql["string"] = new RegExp(req.query.string)
    }
    console.log(noSql)
    try {
      const collection = db.collection('data');
      const totalData = await collection.find(noSql).count();
      const totalPages = limit == 'all' ? 1 : Math.ceil(totalData / limit)
      const limitation = limit == 'all' ? {} : { limit: parseInt(limit), skip: offset }
      const users = await collection.find(noSql, limitation).sort(sortMongo).toArray();
      res.status(200).json({
        data: users,
        totalData,
        totalPages,
        display: limit,
        page: parseInt(page)
      })
    } catch (err) {
      res.status(500).json({ message: "error ambil data" })
    }
  });

  router.get('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('data');
      const user = await collection.findOne({ _id: mongodb.ObjectId(req.params.id) })
      res.status(200).json(user)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "error update data" })
    }
  });

  router.post('/', async function (req, res, next) {
    try {
      const collection = db.collection('data');
      const returnDocument = await collection.insertOne({
        id: parseInt(req.body.id),
        string: req.body.string,
        integer: parseInt(req.body.integer),
        float: parseFloat(req.body.float),
        date: req.body.date,
        boolean: JSON.parse(req.body.boolean),
      });
      const user = await collection.findOne({ _id: returnDocument.insertedId })
      res.status(200).json(user)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "error tambah data" })
    }
  });

  router.put('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('data');
      await collection.updateOne({
        _id: mongodb.ObjectId(req.params.id)
      }, {
        $set: {
          id: parseInt(req.body.id),
          string: req.body.string,
          integer: parseInt(req.body.integer),
          float: parseFloat(req.body.float),
          date: req.body.date,
          boolean: JSON.parse(req.body.boolean),
        }
      });
      const user = await collection.findOne({ _id: mongodb.ObjectId(req.params.id) })
      res.status(200).json(user)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "error update data" })
    }
  });

  router.delete('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('data');
      const user = await collection.findOne({ _id: mongodb.ObjectId(req.params.id) })
      await collection.deleteMany({
        _id: mongodb.ObjectId(req.params.id)
      });
      res.status(200).json(user)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "error delete data" })
    }
  });

  return router;
}