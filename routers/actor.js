const mongoose = require('mongoose');
const Actor = require('../models/actor');
const Movie = require('../models/movie');
module.exports = {
    getAll: function (req, res) {
        Actor.find({}).populate('movies').exec(function (err, actors) {
            if (err) {
                return res.status(404).json(err);
            } else {
                res.json(actors);
            }
        });
    },
    createOne: function (req, res) {
        let newActorDetails = req.body;
        newActorDetails._id = new mongoose.Types.ObjectId();
        let actor = new Actor(newActorDetails);
        actor.save(function (err) {
            res.json(actor);
        });
    },
    getOne: function (req, res) {
        Actor.findOne({ _id: req.params.id })
            .populate('movies')
            .exec(function (err, actor) {
                if (err) return res.status(400).json(err);
                if (!actor) return res.status(404).json();
                res.json(actor);
            });
    },
    updateOne: function (req, res) {
        Actor.findOneAndUpdate({ _id: req.params.id }, req.body, function (err, actor) {
            if (err) return res.status(400).json(err);
            if (!actor) return res.status(404).json();
            res.json(actor);
        });
    },
    deleteOne: function (req, res) {
        Actor.findOneAndRemove({ _id: req.params.id }, function (err) {
            if (err) return res.status(400).json(err);
            res.json();
        });
    },
    addMovie: function (req, res) {
        Actor.findOne({ _id: req.params.id }, function (err, actor) {
            if (err) return res.status(400).json(err);
            if (!actor) return res.status(404).json();
            Movie.findOne({ _id: req.body.id }, function (err, movie) {
                if (err) return res.status(400).json(err);
                if (!movie) return res.status(404).json();
                actor.movies.push(movie._id);
                actor.save(function (err) {
                    if (err) return res.status(500).json(err);
                    res.json(actor);
                });
            })
        });
    },
    deleteActorMovie: function (req, res){
        Actor.findById(req.params.id, function (err, actor) {
            if (err) return res.status(400).json(err);
            for (let i = 0; i < actor.movies.length; i++){
                Movie.findOneAndRemove({ _id: actor.movies[i] }, function (err) {
                    if (err) return res.status(500).json(err);
                })
            }
            Actor.findOneAndRemove({ _id: req.params.id }, function (err) {
                if (err) return res.status(400).json(err);
            });
            res.json();
            console.log('Actors succesfully deleted');
            
        })
    },
    //Remove a movie from the list of movies of an actor
    deleteOneActorMovie: function (req, res){
        Actor.findById(req.params.aid, function (err, actor) {
            if (err) return res.status(400).json(err);
            // let foundIndex = actor.movies.findIndex(function(movieRef) {
            //     return movieRef == req.params.mid;
            // });
            let foundIndex = -1; 
            for (let i = 0; i < actor.movies.length; i++) {
                if (actor.movies[i] == req.params.mid) {
                    foundIndex = i;
                    break;
                }
            };

            if (foundIndex >= 0) {
                actor.movies.splice(foundIndex);
                Actor.updateOne({ _id: req.params.aid }, {
                    movies: actor.movies
                }, function(err, data) {
                    if (err) return res.status(500).json(err);
                    res.json(data);
                });
            }
        })
    }
};