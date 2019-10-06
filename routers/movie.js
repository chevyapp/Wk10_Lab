var Actor = require('../models/actor');
var Movie = require('../models/movie');
const mongoose = require('mongoose');
module.exports = {
    getAll: function (req, res) {
        Movie.find({}).populate('actors').exec(function (err, movies) {
            if (err) {
                return res.status(404).json(err);
            } else {
                res.json(movies);
            }
        });
    },
    createOne: function (req, res) {
        let newMovieDetails = req.body;
        newMovieDetails._id = new mongoose.Types.ObjectId();
        Movie.create(newMovieDetails, function (err, movie) {
            if (err) return res.status(400).json(err);
            res.json(movie);
        });
    },
    getOne: function (req, res) {
        Movie.findOne({ _id: req.params.id })
            .populate('actors')
            .exec(function (err, movie) {
                if (err) return res.status(400).json(err);
                if (!movie) return res.status(404).json();
                res.json(movie);
            });
    },
    updateOne: function (req, res) {
        Movie.findOneAndUpdate({ _id: req.params.id }, req.body, function (err, movie) {
            if (err) return res.status(400).json(err);
            if (!movie) return res.status(404).json();
            res.json(movie);
        });
    },
    //Delete a movie by its ID
    deleteOne: function (req, res) {
        Movie.findOneAndRemove({ _id: req.params.id }, function (err) {
            if (err) return res.status(400).json(err);
            res.json();
        });
    },
    //Remove an actor from the list of actors in a movie
    deleteOneMovieActor: function (req, res) {
        Movie.findById(req.params.mid, function (err, movie) {
            if (err) return res.status(400).json(err);

            let foundIndex = -1;
            for (let i = 0; i < movie.actors.length; i++) {
                if (movie.actors[i] == req.params.aid) {
                    foundIndex = i;
                    break;
                }
            };

            if (foundIndex >= 0) {
                movie.actors.splice(foundIndex);
                Movie.updateOne({ _id: req.params.mid }, { 
                    actors: movie.actors
                }, function (err, data) {
                    if (err) return res.status(500).json(err);
                    res.json(data);
                });
            }
        })
    },
    //Add an existing actor to the list of actors in a movie
    addActor: function (req, res) {
        Movie.findById(req.params.mid, function (err, movie) {
            if (err) return res.status(400).json(err);

            movie.actors.push(req.params.aid);
            Movie.updateOne({ _id: req.params.mid }, {
                actors: movie.actors
            }, function (err, data) {
                if (err) return res.status(500).json(err);
                res.json(data);
            });
        });
    },
    //Retrieve all the movies produced between year1 and year2
    findByDate: function (req, res) {
        let query = { 'year': { $lte: parseInt(req.params.year1), $gte: parseInt(req.params.year2) } };

        Movie.find(query).exec(function (err, movies) {
            if (err) return res.status(400).json(err);

            res.json(movies);
        });
        /**Or could have used:
         * Movie.where('age').gte(req.params.year2).lte(req.params.year1).exec(function (err, docs){
         *   res.json(docs);
         * )});
         */
    },
    incrementYear: function (req, res) {
        Movie.updateMany({'year': {$gt: 1995}}, {$inc: {'year': 7}}, function (err, movies) {
            if (err) return res.status(400).json(err);            
            if (!movies) return res.status(404).json();            
            res.json(movies);
        });
    },
    deleteYear: function (req, res) {
        Movie.deleteMany({'year': {$lt: parseInt(req.params.aYear)}}, function (err) {
            if (err) return res.status(400).json(err);
            res.json();
        });
    }
};