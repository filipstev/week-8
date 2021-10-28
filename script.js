const video = document.getElementById('video');
const play = document.getElementById('play');
const stop = document.getElementById('stop');
const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');
const timestamp = document.getElementById('timestamp');
const fullscreen = document.getElementById('fullscreen');
const mute = document.getElementById('mute');
const volume = document.getElementById('volume-control');
const playback = document.getElementById('playback-speed');
const playbackList = document.querySelector('.playback-list');
const seekTooltip = document.getElementById('seek-tooltip');
const volumeDiv = document.querySelector('.volume');
const player = document.querySelector('.player');
const pausePlay = document.querySelector('.pause-play');

function formatTime(timeInSeconds) {
  const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  return {
    minutes: result.substr(3, 2),
    seconds: result.substr(6, 2),
  };
}

function toggleVideoStatus() {
  if (video.paused) {
    video.play();
    const videoDuration = Math.round(video.duration);
    seek.setAttribute('max', videoDuration - 1);
    progressBar.setAttribute('max', videoDuration - 1);
  } else {
    video.pause();
  }
}

function updatePlayIcon() {
  if (video.paused) {
    play.innerHTML = '<i class="fas fa-play"></i>';
    pausePlay.classList.add('opacity');
  } else {
    play.innerHTML = '<i class="fa fa-pause"></i>';
    pausePlay.classList.remove('opacity');
  }
}

function toggleFullscreen() {
  if (
    window.fullScreen ||
    (window.innerWidth == screen.width && window.innerHeight == screen.height)
  ) {
    fullscreen.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
    document.exitFullscreen();
  } else {
    fullscreen.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
    player.requestFullscreen();
  }
}

function muteSound(e) {
  if (video.volume === 0) {
    volume.value = 50;
    mute.innerHTML = '<i class="fas fa-volume-up"></i>';
    video.muted = false;
    video.volume = 0.5;
    return;
  }
  if (video.muted) {
    video.muted = false;
    mute.innerHTML = '<i class="fas fa-volume-up"></i>';
    const prevVolume = localStorage.getItem('prevVolume');
    volume.value = prevVolume * 100;
  } else {
    video.muted = true;
    mute.innerHTML = '<i class="fas fa-volume-mute"></i>';
    volume.value = 0;
  }
}

function changeVolume(e) {
  video.volume = e.currentTarget.value / 100;
  localStorage.setItem('prevVolume', e.currentTarget.value / 100);

  if (video.muted) {
    video.muted = false;
    mute.innerHTML = '<i class="fas fa-volume-up"></i>';
  }
  if (video.volume === 0) {
    mute.innerHTML = '<i class="fas fa-volume-mute"></i>';
  } else {
    mute.innerHTML = '<i class="fas fa-volume-up"></i>';
  }
}

function togglePlayback() {
  playbackList.classList.toggle('visible');
}

function changeSpeed(e) {
  video.playbackRate = Number(e.target.innerHTML.slice(0, -1));
  playback.innerHTML = e.target.innerHTML;
}

function updateProgress() {
  seek.value = Math.floor(video.currentTime);
  progressBar.value = Math.floor(video.currentTime);
  timestamp.innerHTML = `${formatTime(video.currentTime).minutes}:${
    formatTime(video.currentTime).seconds
  } / ${formatTime(video.duration).minutes}:${
    formatTime(video.duration).seconds
  }`;
}

function skipAhead(event) {
  const skipTo = event.target.dataset.seek
    ? event.target.dataset.seek
    : event.target.value;
  video.currentTime = skipTo;
  progressBar.value = skipTo;
  seek.value = skipTo;
}

function updateSeekTooltip(event) {
  const skipTo = Math.round(
    (event.offsetX / event.target.clientWidth) *
      parseInt(event.target.getAttribute('max'), 10)
  );

  seek.setAttribute('data-seek', skipTo);
  const t = formatTime(skipTo);
  seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
  const rect = video.getBoundingClientRect();
  seekTooltip.style.left = `${event.pageX - rect.left}px`;
}

function toggleDrag(e) {
  volume.classList.add('grabbing');
}

function removeDrag() {
  volume.classList.remove('grabbing');
}

function playbackPhone(e) {
  let rate;
  if (Number(e.target.innerHTML.slice(0, -1)) === 0.5) {
    rate = 0.75;
    playback.innerHTML = '0.75x';
  } else if (Number(e.target.innerHTML.slice(0, -1)) === 0.75) {
    rate = 1;
    playback.innerHTML = '1.0x';
  } else if (Number(e.target.innerHTML.slice(0, -1)) === 1) {
    rate = 1.5;
    playback.innerHTML = '1.5x';
  } else if (Number(e.target.innerHTML.slice(0, -1)) === 1.5) {
    rate = 2;
    playback.innerHTML = '2.0x';
  } else if (Number(e.target.innerHTML.slice(0, -1)) === 2) {
    rate = 0.5;
    playback.innerHTML = '0.5x';
  }
  video.playbackRate = rate;
}

video.addEventListener('click', toggleVideoStatus);
video.addEventListener('pause', updatePlayIcon);
video.addEventListener('play', updatePlayIcon);
video.addEventListener('timeupdate', updateProgress);
fullscreen.addEventListener('click', toggleFullscreen);
mute.addEventListener('click', muteSound);
volume.addEventListener('change', changeVolume);
play.addEventListener('click', toggleVideoStatus);
playback.addEventListener('click', togglePlayback);
playbackList.addEventListener('click', changeSpeed);
seek.addEventListener('input', skipAhead);
seek.addEventListener('mousemove', updateSeekTooltip);
volumeDiv.addEventListener('mouseenter', function () {
  volume.classList.toggle('visible');
});
volume.addEventListener('mousedown', toggleDrag);
volume.addEventListener('mouseup', removeDrag);
pausePlay.addEventListener('click', toggleVideoStatus);

window.addEventListener('orientationchange', function () {
  playback.addEventListener('click', playbackPhone);
});

if (window.innerWidth <= 576) {
  playback.addEventListener('click', playbackPhone);
}

window.addEventListener('load', localStorage.setItem('prevVolume', 0.5));
