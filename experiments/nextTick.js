// use node --trace-gc

// An asynchronous function based on promises that allocates memory
function test() {
  result = new Array(1000);
  for (var i = 0; i < 10000000; i++) {
    result[i % 1000] = i;
  }
  return Promise.resolve(result);
}

function sample() {
  gc();
  var startingMemory = process.memoryUsage();
  var startingTime = process.hrtime();
  var promises = new Array(100);
  for (var i = 0; i < 100; i++) {
    promises[i] = test();
  }
  Promise.all(promises).then(() => {
    var endingTime = process.hrtime(startingTime);
    var endingMemory = process.memoryUsage();
    console.log('*** heapUsed ', endingMemory.heapUsed - startingMemory.heapUsed);
    console.log('*** elapsed  ', endingTime[0] * 1e9 + endingTime[1]);
    process.nextTick(sample);
  });
}

sample();