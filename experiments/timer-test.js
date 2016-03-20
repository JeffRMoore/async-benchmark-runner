"use strict";

console.log('MAIN starting');

function createPromise(from, count) {
  Promise.resolve(false).then( () => {
    console.log('Promise.then from', from, count);
  });
}

var immediateCount = 0;

function immediateTick() {
  console.log('setImmediate enter handler', immediateCount);
  createPromise('setImmediate', immediateCount);
  if (immediateCount++ < 10) {
    setImmediate(immediateTick);
  }
  console.log('setImmediate exit handler', immediateCount-1);
}
console.log('setImmediate before registering handler');
setImmediate(immediateTick);
console.log('setImmediate after registering handler');

var nextCount = 0;

function nextTick() {
  console.log('process.nextTick enter handler', nextCount);
  createPromise('process.nextTick', nextCount);
  if (nextCount++ < 10) {
    process.nextTick(nextTick);
  }
  console.log('process.nextTick exit handler', nextCount-1);
}
console.log('process.nextTick before registering handler');
process.nextTick(nextTick);
console.log('process.nextTick after registering handler ');

var timeoutCount = 0;

function timeout() {
  console.log('setTimeout enter handler', timeoutCount);
  createPromise('setTimeout', timeoutCount);
  if (timeoutCount++ < 10) {
    setTimeout(timeout, 0);
  }
  console.log('setTimeout exit handler', timeoutCount-1);
}
console.log('setTimeout before registering handler ');
setTimeout(timeout, 0);
console.log('setTimeout after registering handler');

var intervalCount = 0;

function interval() {
  console.log('setInterval enter handler', intervalCount);
  createPromise('setInterval', intervalCount);
  if (intervalCount++ >= 10) {
    clearInterval(intervalId);
  }
  console.log('setInterval exit handler', intervalCount-1);
}
console.log('setInterval before registering handler');
var intervalId = setInterval(interval, 0);
console.log('setInterval after registering handler');

console.log('Promise.new A');
new Promise( resolve => {
  console.log('resolving Promise A');
  resolve(true);
}).then(result => {
  console.log('Promise.then from resolving promise A');
}).then(result => {
  console.log('Promise.then from resolving promise A chained then');
});
console.log('Promise.new A after creating');

console.log('Promise.all B before');
Promise.all([
new Promise( resolve => {
  console.log('Resolving Promise.all C');
  resolve(true);
}),
new Promise( resolve => {
  console.log('Resolving Promise.all D');
  resolve(true);
})
]);
console.log('Promise.all B after creating');

console.log('MAIN exiting');