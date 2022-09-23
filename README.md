# jmri - UNDER CONSTRUCTION
Full access to the railroad model with NodeJS via JMRI JSON Servlet.

The JMRI JSON Services provide access to JMRI via JSON data objects via a RESTful interface via a socket interface over WebSockets.

## Prerequisites
JMRI server run and connected to your DCC Command station

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
To be described