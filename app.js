const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
// 用户列表
let users = [];

io.on('connection', socket => {
  io.emit('renderUserList', users);
  socket.on('login', ({ nickname, color }) => {
    const user = {
      id: socket.id,
      nickname,
      color
    }
    let flag = false;
    for (let i = 0; i < users.length; i++) {
      if (users[i].nickname === nickname) {
        socket.emit('loginFail');
        flag = true;
        break;
      }
    }
    if (!flag) {
      users.push(user);
      socket.nickname = nickname;
      socket.color = color;
      io.emit('system', {
        nickname,
        status: '进入'
      });
      io.emit('renderUserList', users);
    }
  });

  socket.on('changeColor', ({ color }) => {
    if (users.length) {
      users.map((item, index) => {
        if (item.id === socket.id) {
          item.color = color;
        }
      });
      socket.color = color;
    }
  });

  socket.on('sendMsg', ({ msg }) => {
    socket.broadcast.emit('receiveMsg', {
      nickname: socket.nickname,
      msg,
      color: socket.color,
      self: false
    });
    socket.emit('receiveMsg', {
      nickname: socket.nickname,
      msg,
      color: socket.color,
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
        nickname: user.nickname,
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