(function() {
document.addEventListener('DOMContentLoaded', function() {
  const SECONDS = 10000;

  let messageList;
  let latestMessageCreatedAt = '2000-01-11T00:00:01.000Z';

  const init = function() {
    getMessagesFromServer();
    setInterval(getMessagesFromServer, SECONDS);

    $('#submit-message').on('click', function() {
      const equalIndex = window.location.search.indexOf('username=');
      const username = window.location.search.slice(equalIndex + 9);

      const userMessage = $('#message-input').val();
      const user = {
        username: username,
        text: userMessage,
        roomname: 'HR'
      };
      postMessageToServer(user);
    });
  };

  const getMessagesFromServer = function() {
    $.ajax({
      url: 'https://api.parse.com/1/classes/messages',
      type: 'GET',
      data: {where: {
        createdAt: {
          '$gt': latestMessageCreatedAt
        }
      }},
      dataType: 'json',
      success: function(data) {
        if (data.results.length !== 0) {
          messageList = escapeArrayOfObjects(data.results);
          renderMessageList();
          console.log('chatterbox: message list retrieved.');
        }
      },
      error: function(data) {
        console.error('chatterbox: Failed to retrieve message list', data);
      }
    });
  };

  const postMessageToServer = function(user) {
    $.ajax({
      url: 'https://api.parse.com/1/classes/messages',
      type: 'POST',
      data: JSON.stringify(user),
      contentType: 'application/json',
      success: function() {
        getMessagesFromServer();
        console.log('chatterbox: Message sent');
      },
      error: function(data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  };

  const escapeArrayOfObjects = function(array) {
    return array.map(function(obj) {
      return _.mapObject(obj, str => _.escape(str));
    });
  };

  const renderMessageList = function() {
    messageList.forEach(function(messageObj, index) {
      $('#chats').prepend(generateMessageElement(messageList[messageList.length - 1 - index]));
    });
    latestMessageCreatedAt = messageList[0].createdAt;
  };

  const generateMessageElement = function({ username, text }) {
    return $(`<div class="chat"><div class="username">${username}</div><div class="message">${text}</div></div>`);
  };

  init();

});
})();
