document.addEventListener("DOMContentLoaded", function() {
  const REFRESH_INTERVAL = 10000;

  let messageList;
  let latestMessageCreatedAt = '2000-01-11T00:00:01.000Z';

  window.app = {
    server: 'https://api.parse.com/1/classes/messages',

    init: function() {
      app.fetch();
      setInterval(app.fetch, REFRESH_INTERVAL);

      $('#submit-message').on('click', app.handleMessageSubmit);
    },

    handleMessageSubmit: function() {
      const params = window.location.search;
      const username = params.slice(params.indexOf('username=') + 9);
      const text = $('#message-input').val();
      app.send({username, text, roomname: 'HR'});
    },

    fetch: function() {
      $.ajax({
        url: app.server,
        type: 'GET',
        data: {where: {createdAt: {'$gt': latestMessageCreatedAt}}},
        dataType: 'json',
        success: function(data) {
          if (data.results.length > 0) {
            messageList = app.escapeArrayOfObjects(data.results);
            app.renderMessageList();
            console.log('chatterbox: message list retrieved.');
          }
        },
        error: function(data) {
          console.error('chatterbox: Failed to retrieve message list', data);
        }
      });
    },

    send: function(messageObj) {
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(messageObj),
        contentType: 'application/json',
        success: function() {
          app.fetch();
          console.log('chatterbox: Message sent');
        },
        error: function(data) {
          console.error('chatterbox: Failed to send message', data);
        }
      });
    },

    escapeArrayOfObjects: function(array) {
      return array.map(function(obj) {
        return _.mapObject(obj, str => _.escape(str));
      });
    },

    renderMessageList: function() {
      for (var i = messageList.length - 1; i >= 0; i--) {
        $('#chats').prepend(app.generateMessageElement(messageList[i]));
        latestMessageCreatedAt = messageList[i].createdAt;
      }
    },

    generateMessageElement: function({ username, text }) {
      return $(`<div class="chat"><div class="username">${username}</div><div class="message">${text}</div></div>`);
    }
  };

  app.init();
});

