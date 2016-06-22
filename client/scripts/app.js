document.addEventListener('DOMContentLoaded', function() {
  const REFRESH_INTERVAL = 10000;
  const GET_ALL_MESSAGES_DATE = '2000-01-11T00:00:01.000Z';
  let roomList;
  let selectedRoom = 'lobby';
  const friendList = [];
  let latestMessageCreatedAt = GET_ALL_MESSAGES_DATE;

  window.app = {
    server: 'https://api.parse.com/1/classes/messages',

    init: function() {
      app.fetch();
      app.fetch({getRooms: true});
      setInterval(app.fetch, REFRESH_INTERVAL);

      $('.username').on('click', app.addFriend);
      $('#send').on('submit', app.handleSubmit);
      $('#roomSelect').on('change', app.handleRoomSelect);
    },

    handleSubmit: function(event) {
      event.preventDefault();
      const params = window.location.search;
      const username = params.slice(params.indexOf('username=') + 9);
      const text = $('#message').val();
      app.send({username, text, roomname: selectedRoom});
    },

    handleRoomSelect: function(event) {
      selectedRoom = this.value;
      latestMessageCreatedAt = GET_ALL_MESSAGES_DATE;
      app.clearMessages();
      if (selectedRoom === '__new-room__') {
        app.createNewRoom();
      } else {
        app.fetch();
      }
    },

    fetch: function(options) {
      let queryOptions;
      if (options && options.getRooms) {
        queryOptions = {keys: 'roomname', limit: 1000};
      } else {
        queryOptions = {where: {roomname: selectedRoom, createdAt: {'$gt': latestMessageCreatedAt}}};
      }// } else {
      //   queryOptions = {where: {createdAt: {'$gt': latestMessageCreatedAt}}};
      // }

      $.ajax({
        url: app.server,
        type: 'GET',
        data: queryOptions,
        dataType: 'json',
        success: function(data) {
          if (data.results.length === 0) {
            return;
          }

          const escaped = app.escapeArrayOfObjects(data.results);
          if (options && options.getRooms) {
            const roomNames = _.uniq(escaped.map(obj => obj.roomname));
            roomNames.forEach(roomName => app.addRoom(roomName));
          } else {
            app.renderMessageList(escaped);
          }// } else {
          //   app.renderMessageList(escaped);
          //   console.log('chatterbox: message list retrieved.');
          // }
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

    renderMessageList: function(messageList) {
      for (var i = messageList.length - 1; i >= 0; i--) {
        $('#chats').prepend(app.generateMessageElement(messageList[i]));
        latestMessageCreatedAt = messageList[i].createdAt;
      }
    },

    clearMessages: function() {
      $('#chats').empty();
    },

    generateMessageElement: function({ username, text }) {
      return $(`<div class="chat"><div class="username">${username}</div><div class="message">${text}</div></div>`);
    },

    addMessage: function({ username, text }) {
      const $messageElement = $(`<div class="chat"><div class="username">${username}</div><div class="message">${text}</div></div>`);
      $('#chats').prepend($messageElement);
    },

    addRoom: function(roomName) {
      const $optionElement = $(`<option value="${roomName}">${roomName}</option>`);
      $('#new-room-option').after($optionElement);
    },

    createNewRoom: function() {
      const newRoomName = prompt('Enter new room name:');
      selectedRoom = newRoomName;
      app.addRoom(newRoomName);
      $('#roomSelect').val(newRoomName);
    },

    addFriend: function() {
      friendList.push($(this).text());
    }
  };

  app.init();
});

