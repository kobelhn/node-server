$(function() {
  const socket = io();
  login();
  socket.on('loginFail', () => {
    layer.alert('昵称重复请重新输入', index => {
      login();
      layer.close(index);
    })
  });
  socket.on('system', ({ nickname, status }) => {
    $('#messages')
      .append(`<div class="system-msg">${new Date().toTimeString().substr(0, 8)} ${nickname}${status}聊天室</div>`);
  });

  socket.on('renderUserList', users => {
    $('.member-list').empty();
    if (users.length > 0) {
      users.map(user => {
        $('.member-list').append(`<div class="member-item">
        <div class="member-img"><img src="./img/avatar_default.jpg" alt="" class="member-avatar"></div>
        <div class="member-name">${user.nickname}</div>
      </div>`);
      });
    }
  });

  socket.on('receiveMsg', ({ nickname, msg, color, self }) => {
    let html = `<div class="msg-item ${self ? 'self' : ''}">`;
    if (!self) {
      html += `<div class="msg-img">
                  <img src="./img/avatar_default.jpg" alt="" class="msg-avatar">
                </div>`;
    }
    html += `<div class="msg-main">
                <div class="msg-user">${nickname}</div>
                <div class="msg-content" style="color: ${color};">${msg}</div>
              </div>`;
    if (self) {
      html += `<div class="msg-img">
                  <img src="./img/avatar_default.jpg" alt="" class="msg-avatar">
                </div>`;
    }
    html += `</div>`;
    $('#messages').append(html);
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
  });
  $('#color').change(() => {
    socket.emit('changeColor', {
      color: $('#color').val()
    });
  });

  $('#file').change(e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onerror = () => {
      layer.msg('读取文件失败，请重试');
    }

    reader.onload = () => {
      const src = reader.result;
      const msg = `<img src="${src}" class="msg-content-img" />`;
      socket.emit('sendMsg', {
        msg,
      });
    }

    reader.readAsDataURL(file);

  });

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
        nickname: val,
        color: '#333'
      });
      layer.close(index);
    });
  }

});