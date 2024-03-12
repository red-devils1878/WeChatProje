/**公共js，计时器，以及基本方法封装 **/
//剩余时间 (单位：毫秒)
let handle = null;
let callback = null;
let milliseconds = 0;

function stop() {
  clearInterval(handle);
  handle = null;

  if( typeof callback == "function" ){
    callback();
  }
}
function init(ms,cb) {
  milliseconds = ms || 0;
  if(!!cb){
    callback = cb;
  }
}
function retime(ms,flag) {
  milliseconds = ms || 0;
  if( !!handle ) return;
  if( !flag ) return;

  console.log(">> retime start");
  console.log("milliseconds",milliseconds);
  start(milliseconds);
  clearInterval(handle);
  handle = setInterval(() => {
    milliseconds = milliseconds - 1000;
      if (milliseconds <= 0) {
        stop();
        return
      }
      start(milliseconds);
  }, 1000)
}
function start(seconds) {
  if (seconds > 0) {
  } else {
    console.log("stop");
    stop()
  }
}

module.exports = {
  init: init,
  retime: retime,
  start: start,
  stop: stop
}