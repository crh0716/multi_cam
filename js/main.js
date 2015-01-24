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

function initVideoContainer(videoContainer, stream) {
  var video = document.createElement('video');
  video.width = 320;
  video.height = 240;
  video.autoplay = true;
  videoContainer.appendChild(video);
  if (typeof stream.getVideoTracks()[0].label !== 'undefined') {
    var deviceLabel = document.createElement('p');
    deviceLabel.innerHTML = stream.getVideoTracks()[0].label;
    videoContainer.appendChild(deviceLabel);
  }
  stream.getVideoTracks()[0].addEventListener('ended', errorMessage);
  attachMediaStream(video, stream);
}

window.onload = function() {
  getSources('video').then(function(sources) {
    return Promise.all(sources.map(function(source) {
      return requestVideo(source.id);
    }));
  }).then(function(videos) {
    var videoContainers = document.querySelectorAll('.video-container');
    videos.forEach(function(video, index) {
      var videoContainer = videoContainers[index];
      if (!videoContainer) {
        console.error('No video container!');
        return;
      }
      initVideoContainer(videoContainer, video);
    });
  });
};
