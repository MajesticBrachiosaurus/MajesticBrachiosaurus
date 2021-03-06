var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//database schema of specific event id url
var EventSchema = new Schema({
  event_id: String,
  event_name: String,
  location: String,
  date: String,
  time: String,
  radius: {
    type: Number,
    default: 1
  },
  choices: {
    businesses: [{
      business_id: String,
      votes: {
        type: Number,
        default: 0
      },
      user: String,
      ips: Array
    }]
  },
  users: [{
    ip: String,
    choicesMade: Array,
    votesCast: Number
  }],
  messages: Array
});
//export the event schema so it can be accessed out of this template by requiring
module.exports = mongoose.model('Event', EventSchema);
