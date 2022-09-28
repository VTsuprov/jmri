# JMRI - websocket - NodeJS
Full access to the railroad model with NodeJS via JMRI JSON Servlet. Feedback is available through subscription to events.

The JMRI JSON Services provide access to JMRI via JSON data objects via a RESTful interface via a socket interface over WebSockets.

## Prerequisites
JMRI server run and connected to your DCC Command station.
To start getting events you have to call a get or a set function for the objects (sensor, throttle, turnout). 

## Installation

```sh
npm install jmri-cli
```

## API

### Initialize

```js
const JMRI = require('jmri-cli');
let myModel = new JMRI("http://192.168.1.30:12080/json/");
```

### Methods
setThrottle({"name": "M62", "address": 5, "speed": 0.6}); 

getTurnout('XT1');

getSensor('XS509');

## Example
```js
myModel.ee.on('hello', data => {
    console.log('hello event');
    console.log('[i] railroad ' + data.railroad + ' is connected');
    test();
})
myModel.ee.on('sensor', data => {
    console.log('sensor event');
    console.log("[i] sensor " + data.name + ' state = ' + data.state);
})
myModel.ee.on('throttle', data => {
    console.log('throttle event');
    console.log('throttle data for ' + data.name + ' speed: ' + data.speed);
})
myModel.ee.on('turnout', data => {
    console.log('turnout event');
    console.log("[i] turnout " + data.name + ' state = ' + data.state);
})

const test = () => {
    console.log('...running test init');
    myModel.setThrottle({"name": "M62", "address": 5, "speed": 0.6});
    myModel.getSensor('XS509');
    myModel.getSensor('XS510');
    myModel.getSensor('XS511');
    myModel.getTurnout('XT1');
    myModel.getTurnout('XT6');
}
```