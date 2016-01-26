import starwars from 'starwars';

import * as db from '../database';
import * as events from '../events';

// const [min, max] = [10000, 45000];
const [min, max] = [5000, 15000];


const general = db.general;

const bill = db.createUser({name: 'Bill'});
const brian = db.createUser({name: 'Brian'});
const dave = db.createUser({name: 'Dave'});
const jing = db.createUser({name: 'Jing'});

const greeter = db.createUser({name: 'Greeter'});

const sendRandomMessage = user => {
  db.sendMessage(starwars(), user.id, general.id);
  setTimeout(() => {
    sendRandomMessage(user);
  }, Math.random() * (max - min) + min);
}

const greetChannel = (greeter, channel) => {
  db.joinChannel(greeter.id, channel.id);

  events.subscribe(`/channel/${channel.id}/members/join`, ev => {
    const user = db.load('User', ev.userId);
    if (user.id !== greeter.id) {
      db.sendMessage(`Hello ${user.name}! Hope you are having a great day!`, greeter.id, channel.id);
    }
  });
}

export const start = () => {
  db.loginUser(bill.id);
  db.loginUser(brian.id);
  db.loginUser(dave.id);
  db.loginUser(jing.id);

  sendRandomMessage(bill);
  sendRandomMessage(brian);
  sendRandomMessage(dave);
  sendRandomMessage(jing);

  const needHelp = db.loadAll('Channel').find(c => c.name === 'need help');
  greetChannel(greeter, needHelp);
}
