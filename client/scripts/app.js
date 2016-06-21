(function() {
document.addEventListener('DOMContentLoaded', function() {
  let messageList;
  let latestMessageCreatedAt = '2000-01-11T00:00:01.000Z';

  const init = function() {
    getMessagesFromServer();
  };

  const getMessagesFromServer = function() {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/messages',
      type: 'GET',
      data: {where: {
        createdAt: {
          '$gt': latestMessageCreatedAt
        }
      }},
      dataType: 'json',
      success: function(data) {
        console.log('chatterbox: message list retrieved.');
        messageList = escapeArrayOfObjects(data.results);
        renderMessageList();
      },
      error: function(data) {
        console.error('chatterbox: Failed to retrieve message list', data);
      }
    });
  };


  const escapeArrayOfObjects = function(array) {
    return array.map(function(obj) {
      return _.mapObject(obj, str => _.escape(str));
    });
  };

  const renderMessageList = function() {
    messageList.forEach(function(messageObj) {
      $('#chats').append(generateMessageElement(messageObj));
    });
    latestMessageCreatedAt = messageList[0].createdAt;
  };

  const generateMessageElement = function({ username, text }) {
    return $(`<div class="chat"><div class="username">${username}</div><div class="message">${text}</div></div>`);
  };

  init();

});
})();
