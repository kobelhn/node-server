const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
// 用户列表
let users = [];

io.on('connection', socket => {
  io.emit('renderUserList', users);
  socket.on('login', data => {
    const user = {
      id: socket.id,
      name: data.name,
      color: '#333'
    }
    let flag = false;
    for (let user in users) {
      if (user.name === data.name) {
        socket.emit('loginFail', data.name);
        flag = true;
        break;
      }
    }
    if (!flag) {
      users.push(user);
      socket.nickname = user.name;
      io.emit('system', {
        name: user.name,
        status: '进入'
      });
      io.emit('renderUserList', users);
    }
  });
  socket.on('sendMsg', data => {
    socket.broadcast.emit('receiveMsg', {
      name: socket.nickname,
      msg: data.msg,
      self: false
    });
    socket.emit('receiveMsg', {
      name: socket.nickname,
      msg: data.msg,
      self: true
    });
  });

  socket.on('disconnect', () => {
    let user = null;
    if (users.length) {
      users.map((item, index) => {
        if (item.id === socket.id) {
          user = item;
          users.splice(index, 1);
        }
      });
      io.emit('system', {
        name: user.name,
        status: '离开'
      });
      io.emit('renderUserList', users);
    }
  });
});

app.use('/', express.static(__dirname + '/public'));

http.listen(3000, () => {
  console.log('Listening port 3000, access to http://localhost:3000');
});