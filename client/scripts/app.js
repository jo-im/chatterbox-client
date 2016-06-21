(function() {
document.addEventListener('DOMContentLoaded', function() {
  const REFRESH_INTERVAL = 10000;
  const SERVER_URL = 'https://api.parse.com/1/classes/messages';

  let messageList;
  let latestMessageCreatedAt = '2000-01-11T00:00:01.000Z';

  const init = function() {
    getMessagesFromServer();
    setInterval(getMessagesFromServer, REFRESH_INTERVAL);

    $('#submit-message').on('click', handleMessageSubmit);
  };

  const handleMessageSubmit = function() {
    const params = window.location.search;
    const username = params.slice(params.indexOf('username=') + 9);
    const text = $('#message-input').val();
    postMessageToServer(username, text, 'HR');
  };

  const getMessagesFromServer = function() {
    $.ajax({
      url: SERVER_URL,
      type: 'GET',
      data: {where: {createdAt: {'$gt': latestMessageCreatedAt}}},
      dataType: 'json',
      success: function(data) {
        if (data.results.length > 0) {
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

  const postMessageToServer = function(username, text, roomname) {
    $.ajax({
      url: SERVER_URL,
      type: 'POST',
      data: JSON.stringify({username, text, roomname}),
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
    for (var i = messageList.length - 1; i >= 0; i--) {
      $('#chats').prepend(generateMessageElement(messageList[i]));
      latestMessageCreatedAt = messageList[i].createdAt;
    }
  };

  const generateMessageElement = function({ username, text }) {
    return $(`<div class="chat"><div class="username">${username}</div><div class="message">${text}</div></div>`);
  };

  init();

});
})();
