$(function() {
  const socket = io();
  login();
  socket.on('loginFail', name => {
    layer.alert('昵称重复请重新输入', index => {
      login();
      layer.close(index);
    })
  });

  socket.on('system', data => {
    $('#messages')
      .append(`<div class="system-msg">${new Date().toTimeString().substr(0, 8)} ${data.name}${data.status}聊天室</div>`);
  });

  socket.on('renderUserList', users => {
    $('.member-list').empty();
    if (users.length > 0) {
      users.map(user => {
        $('.member-list').append(`<div class="member-item">
        <div class="member-img"><img src="./img/avatar_default.jpg" alt="" class="member-avatar"></div>
        <div class="member-name">${user.name}</div>
      </div>`);
      });
    }
  });

  socket.on('receiveMsg', data => {
    $('#messages').append(`<div class="msg-item ${data.self ? 'self' : ''}">
      <div class="msg-img">
        <img src="./img/avatar_default.jpg" alt="" class="msg-avatar">
      </div>
      <div class="msg-main">
        <div class="msg-user">${data.name}</div>
        <div class="msg-content">${data.msg}</div>
      </div>
    </div>`);
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  });

  $('#close').click(() => {
    window.close();
  });
  $('#send').click(sendMsg);
  $('#input').keyup(e => {
    if (e.keyCode === 13) {
      sendMsg();
    }
  })

  function sendMsg() {
    if (!$('#input').val()) {
      layer.msg('请输入聊天内容', { time: 1000 });
      return false;
    }
    socket.emit('sendMsg', {
      msg: $('#input').val()
    });
    $('#input').val('');
  }


  function login() {
    layer.prompt({
      title: '请输入昵称',
      maxlength: 10,
      closeBtn: 0,
      btn: '确认'
    }, (val, index) => {
      if (!val) {
        return false;
      }
      socket.emit('login', {
        name: val,
        color: '#333'
      });
      layer.close(index);
    });
  }

});