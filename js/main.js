'use strict';

var VIDEO_WIDTH = 320;
var VIDEO_HEIGHT = 240;

function getSources(type) {
  if (typeof MediaStreamTrack.getSources === 'undefined') {
    return Promise.reject(
      'Your browser does not support getSources, aborting.');
  } else {
    var videoSources;
    return new Promise(function(resolve, reject) {
      MediaStreamTrack.getSources(function(sources) {
        videoSources = sources.filter(function(source) {
          return (source.kind === type);
        });
        resolve(videoSources);
      });
    });
  }
}

function requestVideo(id) {
  return new Promise(function(resolve, reject) {
    getUserMedia({
      video: {
        optional: [{ sourceId: id }],
        mandatory: {
          minWidth: VIDEO_WIDTH,
          minHeight: VIDEO_HEIGHT,
          maxWidth: VIDEO_WIDTH,
          maxHeight: VIDEO_HEIGHT
        }
      },
      audio: false
    }, resolve, function(error) {
      alert('User media request denied with error: ' + error.name);
      resolve(null);
    });
  });
}

var errorMessage = function(event) {
  var message = 'getUserMedia successful but ' + event.type + ' event fired ' +
                'from camera. Most likely too many cameras on the same USB ' +
                'bus/hub. Verify this by disconnecting one of the cameras ' +
                'and try again.';
  document.getElementById('messages').innerHTML += event.target.label + ': ' +
                                                   message + '<br><br>';
};

window.onload = function() {
  getSources('video').then(function(sources) {
    return Promise.all(sources.map(function(source) {
      return requestVideo(source.id);
    }));
  }).then(function(videos) {
    var stage = document.querySelector('.stage');
    var v1 = new VideoContainer(videos[0], {
      pos: 'left'
    });
    var v1p = new VideoContainer(videos[0], {
      pos: 'right',
      mirror: true
    });

    stage.appendChild(v1.root);
    stage.appendChild(v1p.root);
  }).catch(function(error) {
    console.error(error);
  });
};
