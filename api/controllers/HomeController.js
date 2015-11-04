/**
 * HomeController
 *
 * @description :: Server-side logic for managing Homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index : function(req, res){
    var someAttributes = {
      lastName: 'Simpson',
      favoriteFood: 'beer'
    };

    var id = 'homer@simpsons.com';

    MyModel.create({
      name : 'test'
    }).exec(function(err, ress){
      MyModel.find({}).exec(function(err, mymodels){
        mymodels.forEach(function(index, item){
          sails.log('debug','Item => ', item, index.name, index.createdAt);
        });
      })
      sails.log('debug','Finished creating first blabla : ', ress);
      return res.view('homepage');
    })

  }
};

