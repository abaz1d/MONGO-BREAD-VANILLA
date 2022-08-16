var express = require('express');
var router = express.Router();
const mongodb = require('mongodb')

module.exports = function (db) {
  router.get('/', async function (req, res, next) {
    const limit = parseInt(req.query.display) 
    const page = req.query.page || 1

    const offset = limit == 'all' ? 0 : (page - 1) * limit;
    const searchParams = {}

    // browse
    if (req.query.nama) {
      searchParams['nama'] = new RegExp(`${req.query.nama}`, 'i');
    }
    if (req.query.tinggi) {
      searchParams['tinggi'] = parseFloat(req.query.tinggi)
    }
    if (req.query.sudahMenikah) {
      searchParams['sudahMenikah'] = JSON.parse(req.query.sudahMenikah)
    }
    try {
      const collection = db.collection('users');

      const totalData = await collection.find(searchParams).count();
      const totalPages = limit == 'all' ? 1 : Math.ceil(totalData / limit);
      const limitation = limit == 'all' ? {} : { limit: parseInt(limit), skip: offset }

      const users = await collection.find(searchParams, limitation).toArray()

      res.status(200).json({
        data: users,
        totalData,
        totalPages,
        display: limit,
        page: parseInt(page)
      })
    }
    catch (err) {
      res.status(500).json({ message: "error ambil data", err })
    }
  });
  router.post('/', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      const returnDocument = await collection.insertOne({
        nama: req.body.nama,
        tinggi: parseFloat(req.body.tinggi),
        sudahMenikah: JSON.parse(req.body.sudahMenikah)
      })
      const user = await collection.findOne({ _id: returnDocument.insertedId })
      res.status(200).json(user)
    } catch (err) {
      res.status(500).json({ message: "error ambil data", error: `${err}`})
      console.log(err)
    }
  })
  router.get('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      const user = await collection.findOne({
        _id: mongodb.ObjectId(req.params.id)
      });
      res.status(200).json(user)
    }
    catch {
      res.status(500).json({ message: "error ambil data" })
    }
  })
  router.put('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      await collection.updateOne({
        _id: mongodb.ObjectId(req.params.id)
      }, {
        $set: {
          nama: req.body.nama,
          tinggi: parseFloat(req.body.tinggi),
          sudahMenikah: JSON.parse(req.body.sudahMenikah)
        }
      });
      const user = await collection.findOne({ _id: mongodb.ObjectId(req.params.id) })
      res.status(200).json(user)
    }
    catch {
      res.status(500).json({ message: "error ambil data" })
    }
  })
  router.delete('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      const user = await collection.findOne({ _id: mongodb.ObjectId(req.params.id) })
      await collection.deleteMany({
        _id: mongodb.ObjectId(req.params.id)
      });
      res.status(200).json(user)
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ message: "error delete data", err })
    }
  })



  return router;
} 