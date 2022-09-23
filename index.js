const WebSocketClient = require('websocket').client;
const EventEmitter = require("events");

/*
{type: 'turnout', method: 'post', data: {…}}
data: {name: 'XT1', state: 4}
method: "post"
type: "turnout"

{type: 'throttle', method: 'post', data: {…}}
data: {name: 'M62', address: 5, forward: false}
method: "post"
type: "throttle"
* */

class Logger {

  log(message){
    if(console && console.log){
      console.log(message);
    }
  }

  warn(message){
    if(console && console.warn){
      console.warn(message);
    } else {
      this.log(message);
    }
  }

  error(message){
    if(console && console.error){
      console.error(message);
    } else {
      this.warn(message);
    }
  }
}

class Emitter extends EventEmitter {}

const JMRI = function (url, bindings) {
  console.log("создаю экземпляр JMRI");
  const log = new Logger();
  const websocket = new WebSocketClient();
  this.ee = new Emitter();
  this.socket = null;
  this.ws_connect = () => {
    websocket.connect(this.url.replace(/^http/, "ws")/*, 'echo-protocol'*/);
    websocket.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
      console.log(websocket);
    });

    websocket.on('connect', (connection) => {
      console.log('WebSocket Client Connected');
      websocket._send = connection.send;
      websocket.conn = connection;
      connection.on('error', (error) => {
        console.log("Connection Error: " + error.toString());
        //websocket.jmri.reconnect();
      });
      connection.on('close', () => {
        console.log('Connection Closed');
        this.reconnect();
      });
      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          //console.log("Received: '" + message.utf8Data + "'");
          let event;
          try {
            event = JSON.parse(message.utf8Data);
            //console.log('[i] got event of type = ' + event.type);
          } catch (e) {
            console.log('message Json parse error')
          }
          if(event) {
            if (this[event.type]) {
              //console.log(this[event.type]);
              this[event.type].call(this, event.data);
            } else {
              console.log('[!] this event type is not described');
            }
          }

          /*
          message.utf8Data:

          * {"type":"hello","data":{"JMRI":"4.20+Rc7ba8249b","json":"5.4.0","version":"v5","heartbeat":13500,
          * "railroad":"AlhimikTT","node":"jmri-DCA63287DB29-3f66e423","activeProfile":"Digitrax Simulator"}}
          *
          * {"type":"throttle","data":{"address":5,"speed":0.6,"forward":false,"F0":true,"F1":false,"F2":false,
          * "F3":false,"F4":false,"F5":false,"F6":false,"F7":false,"F8":false,"F9":false,"F10":false,"F11":false,
          * "F12":false,"F13":false,"F14":false,"F15":false,"F16":false,"F17":false,"F18":false,"F19":false,
          * "F20":false,"F21":false,"F22":false,"F23":false,"F24":false,"F25":false,"F26":false,"F27":false,
          * "F28":false,"speedSteps":28,"clients":2,"rosterEntry":"M62","name":"M62","throttle":"M62"}}
          *
          * {"type":"throttle","data":{"speed":1.0,"name":"M62","throttle":"M62"}}

          sensor XS505 4
            comment: "Ext2"
            inverted: false
            name: "XS510"
            properties: []
            state: 2
            userName: null
          * */

        } else {
          console.log("Received not utf8:");
          console.log(message);
        }
      });
      //websocket.test(connection);
      function sendNumber() {
        if (connection.connected) {
          var number = Math.round(Math.random() * 0xFFFFFF);
          connection.sendUTF(number.toString());
          setTimeout(sendNumber, 1000);
        }
      }
      //sendNumber();
    });

    websocket.test = (connection) => {
      let m = {type: 'throttle', method: 'post', data: {"name": "M62", "address": 5, "speed": 0.6}};
      //connection.send(JSON.stringify(m));
      //this.setThrottle({"name": "M62", "address": 5, "speed": 0.6});
      this.getSensor('XS509');
      this.getSensor('XS510');
      this.getSensor('XS511');
      this.getTurnout('XT1');
      this.getTurnout('XT6');

      /*m = {type: "sensor", data: { name: 'XS509' }};
      connection.send(JSON.stringify(m));
      m = {type: "sensor", data: { name: 'XS510' }};
      connection.send(JSON.stringify(m));
      m = {type: "sensor", data: { name: 'XS511' }};
      connection.send(JSON.stringify(m));*/
    }

    websocket.send = (type, data, method) => {
      let m = { type: type, method: method || 'post' };
      //m = $.extend(true, m, $.extend(true, {}, settings.options, m));
      if (data) m['data'] = data;
      //console.log('trying to send type = ' + type);
      websocket.conn.send(JSON.stringify(m));
      //return websocket._send(JSON.stringify(m));
    };
  }


  if (typeof (url) === 'string') {
    this.url = url;
  } else {
    this.url = "http://192.168.1.30:12080/json/";
    //this.url = document.URL.split('/')[0] + "//" + document.URL.split('/')[2] + "/json/";
    //bindings = url;
  }
  // Default event handlers that do nothing
  this.console = function (data) {
  };
  this.error = function (error) {
  };
  this.open = function () {
  };
  this.close = function (event) {
  };
  this.willReconnect = function (attempts, milliseconds) {
  };
  this.didReconnect = function () {
  };
  this.failedReconnect = function () {
  };
  this.ping = function (d) {
    console.log(d);
  };
  this.pong = function () {
  };
  this.hello = function (data) {

    this.ee.emit('hello', data);
    this.heartbeatInterval = setInterval(this.heartbeat, data.heartbeat);
  };
  this.goodbye = function (data) {
  };
  this.block = function (name, value, data) {
    console.log("block", name, value, data);
  };
  this.blocks = function (data) {
    console.log("blocks", data);
  };
  this.car = function (name, data) {
  };
  this.cars = function (data) {
  };
  this.configProfile = function (name, data) {
  };
  this.configProfiles = function (data) {
  };
  this.consist = function (name, data) {
  };
  this.consists = function (data) {
  };
  this.engine = function (name, data) {
  };
  this.engines = function (data) {
  };
  this.idTag = function (name, state, data) {
  };
  this.idTags = function (data) {
  };
  this.layoutBlock = function (name, value, data) {
    console.log('layoutBlock', name, value, data);
  };
  this.layoutBlocks = function (data) {
    console.log("layoutBlocks", name, value, data);
  };
  this.light = function (name, state, data) {
  };
  this.lights = function (data) {
  };
  this.location = function (name, data) {
  };
  this.locations = function (data) {
  };
  this.memory = function (name, value, data) {
  };
  this.memories = function (data) {
  };
  this.metadata = function (data) {
  };
  this.networkService = function (name, data) {
  };
  this.networkServices = function (data) {
  };
  this.oblock = function (name, value, data) {
  };
  this.oblocks = function (data) {
  };
  this.panel = function (name, value, data) {
  };
  this.panels = function (data) {
  };
  this.power = function (state) {
  };
  this.railroad = function (name) {
  };
  this.reporter = function (name, value, data) {
  };
  this.reporters = function (data) {
  };
  this.roster = function (data) {
  };
  this.rosterGroups = function (data) {
  };
  this.rosterGroup = function (name, data) {
  };
  this.rosterEntry = function (name, data) {
  };
  this.route = function (name, state, data) {
  };
  this.routes = function (data) {
  };
  this.sensor = function (data) {
    let state = 0;
    if(+data.state) {
      state = this.settings.sensor[+data.state];
      data.state = state;
    }

    this.ee.emit('sensor', data);
  };
  this.sensors = function (data) {
  };
  this.signalHead = function (name, state, data) {
  };
  this.signalHeads = function (data) {
  };
  this.signalMast = function (name, state, data) {
  };
  this.signalMasts = function (data) {
  };
  this.systemConnection = function (name, data) {
  };
  this.systemConnections = function (data) {
  };
  this.throttle = function (data) {
    if(data.speed !== undefined) {

      this.ee.emit('throttle', data);
    }
  };
  this.time = function (time, data) {
  };
  this.train = function (name, data) {
  };
  this.trains = function (data) {
  };
  this.turnout = function (data) {
    let state = 0;
    if(+data.state) {
      state = this.settings.turnout[+data.state];
      data.state = state;
    }

    this.ee.emit('turnout', data);
  };
  this.turnouts = function (data) {
  };
  this.version = function (string) {
  };
  // Add user-defined handlers to the settings object
  //$.extend(jmri, bindings);
  // Constants\
  this.settings = {
    sensor: {2: 'ACTIVE', 4: 'INACTIVE'},
    turnout: {2: 'CLOSED', 4: 'THROWN', 8: 'INCONSISTENT'}
  }
  this.UNKNOWN = 0;
  this.POWER_ON = 2;
  this.POWER_OFF = 4;

  // Getters and Setters
  /*
  ADDES
   */
  this.setJMRI = function(type, name, args) {
    //if (!heartbeat) {this.error(0, 'The JMRI WebSocket service is not ready.\nSolve the problem and refresh web page.'); return;}
    var lp;
    if (type == 'throttle') lp = (name) ? {"throttle":name} : {};
    else lp = (name) ? {"name":name} : {};
    //this.toSend(JSON.stringify({"type":type,"data":this.jsonConcat(lp, args)}));
    console.log(this.jsonConcat(lp, args));
    this.socket.send(type, this.jsonConcat(lp, args));
  };
  this.jsonConcat = function(o1, o2) {	// Concatenate JSON name-value pair lists
    var o = {};
    var key;
    for (key in o1) o[key] = o1[key];
    for (key in o2) o[key] = o2[key];
    return o;
  };

  this.getLight = function (name) {
    if (this.socket) {
      this.socket.send("light", { name: name });
    } else {
      $.getJSON(this.url + "light/" + name, function (json) {
        this.light(json.data.name, json.data.state, json.data);
      });
    }
  };
  this.setLight = function (name, state) {
    if (this.socket) {
      this.socket.send("light", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "light/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.light(json.data.name, json.data.state, json.data);
          this.getLight(json.data.name, json.data.state);
        }
      });
    }
  };
  this.getMemory = function (name) {
    if (this.socket) {
      this.socket.send("memory", { name: name });
    } else {
      $.getJSON(this.url + "memory/" + name, function (json) {
        this.memory(json.data.name, json.data.value, json.data);
      });
    }
  };
  this.setMemory = function (name, value) {
    if (this.socket) {
      this.socket.send("memory", { name: name, value: value }, 'post');
    } else {
      $.ajax({
        url: this.url + "memory/" + name,
        type: "POST",
        data: JSON.stringify({ value: value }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.memory(json.data.name, json.data.value, json.data);
          this.getMemory(json.data.name, json.data.value);
        }
      });
    }
  };
  this.getReporter = function (name) {
    if (this.socket) {
      this.socket.send("reporter", { name: name });
    } else {
      $.getJSON(this.url + "reporter/" + name, function (json) {
        this.reporter(json.data.name, json.data.value, json.data);
      });
    }
  };
  this.setReporter = function (name, value) {
    if (this.socket) {
      this.socket.send("reporter", { name: name, value: value }, 'post');
    } else {
      $.ajax({
        url: this.url + "reporter/" + name,
        type: "POST",
        data: JSON.stringify({ value: value }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.reporter(json.data.name, json.data.report, json.data);
          this.getReporter(json.data.name, json.data.report);
        }
      });
    }
  };
  this.getBlock = function (name) {
    if (this.socket) {
      this.socket.send("block", { name: name });
    } else {
      $.getJSON(this.url + "block/" + name, function (json) {
        this.block(json.data.name, json.data.value, json.data);
      });
    }
  };
  this.setBlock = function (name, value) {
    if (this.socket) {
      this.socket.send("block", { name: name, value: value }, 'post');
    } else {
      $.ajax({
        url: this.url + "block/" + name,
        type: "POST",
        data: JSON.stringify({ value: value }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.block(json.data.name, json.data.value, json.data);
          this.getBlock(json.data.name, json.data.value);
        }
      });
    }
  };
  this.getIdTag = function (name) {
    if (this.socket) {
      this.socket.send("idTag", { name: name });
    } else {
      $.getJSON(this.url + "idTag/" + name, function (json) {
        this.idTag(json.data.name, json.data.state, json.data);
      });
    }
  };
  this.setIdTag = function (name, state) {
    if (this.socket) {
      this.socket.send("idTag", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "idTag/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.idTag(json.data.name, json.data.state, json.data);
          this.getIdTag(json.data.name, json.data.state);
        }
      });
    }
  };
  this.getLayoutBlock = function (name) {
    if (this.socket) {
      this.socket.send("layoutBlock", { name: name });
    } else {
      $.getJSON(this.url + "layoutBlock/" + name, function (json) {
        this.layoutBlock(json.data.name, json.data.value, json.data);
      });
    }
  };
  this.setLayoutBlock = function (name, value) {
    if (this.socket) {
      this.socket.send("layoutBlock", { name: name, value: value }, 'post');
    } else {
      $.ajax({
        url: this.url + "layoutBlock/" + name,
        type: "POST",
        data: JSON.stringify({ value: value }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.layoutBlock(json.data.name, json.data.value, json.data);
          this.getLayoutBlock(json.data.name, json.data.value);
        }
      });
    }
  };
  this.getOblock = function (name) {
    if (this.socket) {
      this.socket.send("oblock", { name: name });
    } else {
      $.getJSON(this.url + "oblock/" + name, function (json) {
        this.oblock(json.data.name, json.data.status, json.data); // copied from sensor
      });
    }
  };
  this.setOblock = function (name, value) {
    if (this.socket) {
      this.socket.send("oblock", { name: name, value: value }, 'post');
    } else {
      $.ajax({
        url: this.url + "oblock/" + name,
        type: "POST",
        data: JSON.stringify({ value: value }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.oblock(json.data.name, json.data.status, json.data);
          this.getOblock(json.data.name, json.data.status);
        }
      });
    }
  };

  /**
   * Request a json list of the specified list type. Individual
   * listeners for each instance of the type will need to be set
   * up by the consuming client by requesting the state of each
   * item in the returned list individually.
   * @param {String} type of list (e.g. "sensors")
   */
  this.getList = function (name) {
    //this.socket._send(JSON.stringify({ list: name }));
  };

  this.getObject = function (type, name) {
    switch (type) {
      case "light":
        this.getLight(name);
        break;
      case "block":
        this.getBlock(name);
        break;
      case "idTag":
        this.getIdTag(name);
        break;
      case "layoutBlock":
        this.getLayoutBlock(name);
        break;
      case "memory":
        this.getMemory(name);
        break;
      case "oblock":
        this.getOblock(name);
        break;
      case "reporter":
        this.getReporter(name);
        break;
      case "rosterEntry":
        this.getRosterEntry(name);
        break;
      case "rosterGroup":
        this.getRosterGroup(name);
        break;
      case "route":
        this.getRoute(name);
        break;
      case "sensor":
        this.getSensor(name);
        break;
      case "signalHead":
        this.getSignalHead(name);
        break;
      case "signalMast":
        this.getSignalMast(name);
        break;
      case "turnout":
        this.getTurnout(name);
        break;
      default:
        log.warn("WARN-unknown type of " + type + " encountered by jquery.this.js in getObject().");

    }
  };
  this.setObject = function (type, name, state) {
    switch (type) {
      case "light":
        this.setLight(name, state, 'post');
        break;
      case "memory":
        this.setMemory(name, state, 'post');
        break;
      case "reporter":
        this.setReporter(name, report, 'post');
        break;
      case "block":
        this.setBlock(name, state, 'post');
        break;
      case "idTag":
        this.setIdTag(name, state, 'post');
        break;
      case "layoutBlock":
        this.setLayoutBlock(name, state, 'post');
        break;
      case "oblock":
        this.setOblock(name, status, 'post');
        break;
      case "rosterEntry":
        this.setRosterEntry(name, state, 'post');
        break;
      case "route":
        this.setRoute(name, state, 'post');
        break;
      case "sensor":
        this.setSensor(name, state, 'post');
        break;
      case "signalHead":
        this.setSignalHead(name, state, 'post');
        break;
      case "signalMast":
        this.setSignalMast(name, state, 'post');
        break;
      case "turnout":
        this.setTurnout(name, state, 'post');
        break;
      default:
        log.log("WARN-unknown type of " + type + " encountered by jquery.this.js in setObject().");
    }
  };
  this.getPower = function () {
    if (this.socket) {
      this.socket.send("power", {});
    } else {
      $.getJSON(this.url + "power", function (json) {
        this.power(json.data.state);
      });
    }
  };
  this.setPower = function (state) {
    if (this.socket) {
      this.socket.send("power", { state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "power",
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.power(json.data.state);
        }
      });
    }
  };
  this.getRosterGroup = function (name) {
    if (this.socket) {
      this.socket.send("rosterGroup", { name: name });
    } else {
      $.getJSON(this.url + "rosterGroup/" + name, function (json) {
        this.rosterGroup(json.data.name, json.data);
      });
    }
  };
  this.getRosterEntry = function (name) {
    if (this.socket) {
      this.socket.send("rosterEntry", { name: name });
    } else {
      $.getJSON(this.url + "rosterEntry/" + name, function (json) {
        this.rosterEntry(json.data.name, json.data);
      });
    }
  };
  this.getRoute = function (name) {
    if (this.socket) {
      this.socket.send("route", { name: name });
    } else {
      $.getJSON(this.url + "route/" + name, function (json) {
        this.route(json.data.name, json.data.state, json.data);
      });
    }
  };
  this.setRoute = function (name, state) {
    if (this.socket) {
      this.socket.send("route", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "route/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.route(json.data.name, json.data.state, json.data);
          this.getRoute(json.data.name, json.data.state);
        }
      });
    }
  };
  this.getSensor = function (name) {
    if (websocket) {
      websocket.send("sensor", { name: name });
    } else {
      return false;
    }
  };
  this.setSensor = function (name, state) {
    if (this.socket) {
      this.socket.send("sensor", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "sensor/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.sensor(json.data.name, json.data.state, json.data);
          this.getSensor(json.data.name, json.data.state);
        }
      });
    }
  };
  this.getSignalHead = function (name) {
    if (this.socket) {
      this.socket.send("signalHead", { name: name });
    } else {
      $.getJSON(this.url + "signalHead/" + name, function (json) {
        this.signalHead(json.data.name, json.data.state, json.data);
      });
    }
  };
  this.setSignalHead = function (name, state) {
    if (this.socket) {
      this.socket.send("signalHead", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "signalHead/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.signalHead(json.data.name, json.data.state, json.data);
          this.getSignalHead(json.data.name, json.data.state);
        }
      });
    }
  };
  this.getSignalMast = function (name) {
    if (this.socket) {
      this.socket.send("signalMast", { name: name });
    } else {
      $.getJSON(this.url + "signalMast/" + name, function (json) {
        this.signalMast(json.data.name, json.data.state, json.data);
      });
    }
  };
  this.setSignalMast = function (name, state) {
    if (this.socket) {
      this.socket.send("signalMast", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "signalMast/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.signalMast(json.data.name, json.data.state, json.data);
          this.getSignalMast(json.data.name, json.data.state);
        }
      });
    }
  };
  /**
   * Get the current status of the throttle
   *
   * @param {String} throttle identity
   * @returns {Boolean} false if unable to use throttles
   */
  this.getThrottle = function (throttle) {
    if (websocket) {
      websocket.send("throttle", throttle);
      return true;
    } else {
      return false;
    }
  };
  /**
   * Set some aspect of a throttle as defined in data
   *
   * Call this method with the data elements address:[dcc address]
   * or rosterEntry:[roster entry id] to create a JMRI throttle. Include the
   * data element status:true to get the complete throttle status.
   *
   * @param {string} throttle the throttle identity
   * @param {object} data key/value pairs of the throttle properties to change
   * @returns {boolean} false if unable to use throttles
   */
  this.setThrottle = function (data) {
    if (websocket) {
      data = data || {"name": "M62", "address": 5, "speed": 0.6};
      websocket.send("throttle", data, 'post');
      return true;
    } else {
      return false;
    }
  };
  this.getTime = function () {
    if (this.socket) {
      this.socket.send("time", {});
    } else {
      $.getJSON(this.url + "time", function (json) {
        this.time(json.data.time, json.data);
      });
    }
  };
  this.getTrain = function (name) {
    if (this.socket) {
      this.socket.send("train", { name: name });
    } else {
      $.getJSON(this.url + "train/" + name, function (json) {
        this.train(json.data.name, json.data);
      });
    }
  };
  this.getTurnout = function (name) {
    if (websocket) {
      websocket.send("turnout", { name: name });
      return true;
    } else {
      return false;
    }
  };
  this.setTurnout = function (name, state) {
    if (this.socket) {
      this.socket.send("turnout", { name: name, state: state }, 'post');
    } else {
      $.ajax({
        url: this.url + "turnout/" + name,
        type: "POST",
        data: JSON.stringify({ state: state }),
        contentType: "application/json; charset=utf-8",
        success: function (json) {
          this.turnout(json.data.name, json.data.state, json.data);
          this.getTurnout(json.data.name, json.data.state);
        }
      });
    }
  };
  /**
   * Force the jmri object to begin communicating with the JMRI server
   * even if the WebSocket connection cannot be immediately established
   *
   * @returns {undefined}
   */
  this.connect = function () {
    // if the JMRI WebSocket was open before we overloaded the
    // open() method, we call the open() method to ensure it gets
    // called
    if (this.socket && this.socket.readyState === 1) {
      this.log("Connecting on connect()");
      this.open();
    } else {
      // if the JMRI WebSocket was not open when the document was
      // ready, wait one second and call open() if the socket
      // did not open in the meantime -- with the exception of
      // throttles, the JMRI object can work around the inability
      // to use WebSockets
      setTimeout(function () {
        if (!this.socket || this.socket.readyState !== 1) {
          this.log("Connecting on timeout");
          this.open();
        }
      }, 1000);
    }
  };
  // Logging
  // Object unique identity - an eight digit hexidecimal number
  this.serialNumber = (Math.random().toString(16) + "000000000").substr(2, 8);
  this.logWithDateTimeStamp = false;
  this.log = function (message) {
    if (this.logWithDateTimeStamp) {
      log.log(new Date().toJSON() + " " + this.serialNumber + " " + message);
    } else {
      log.log(this.serialNumber + " " + message);
    }
  };
  // Heartbeat
  this.heartbeat = function () {
    websocket.send("ping");
    //this.socket.send("ping");
    //this.ping();
  };
  this.heartbeatInterval = null;
  // WebSocket
  this.reconnectAttempts = 0;
  this.reconnectPoller = null;
  this.reconnectDelay = 0;
  this.reconnectPolls = 0;
  this.attemptReconnection = function () {
    if (this.reconnectAttempts < 20) {
      this.reconnectAttempts++;
      this.reconnectDelay = 15000 * this.reconnectAttempts;
      this.willReconnect(this.reconnectAttempts, this.reconnectDelay);
      this.log("Reconnecting WebSocket (attempt " + this.reconnectAttempts + "/20)");
      setTimeout(
        function () {
          if (this.reconnectAttempts === 1) {
            this.log("Reconnecting from closed connection.");
          } else {
            this.log("Reconnecting from failed reconnection attempt.");
          }
          this.reconnect();
        }, this.reconnectDelay);
    } else {
      this.failedReconnect();
    }
  };
  //set of functions for handling each "type" of json message
  /*this.events = {
    // TODO: add panel and programmer-related events
    error: function (e) {
      this.log("Error " + e.data.code + ": " + e.data.message);
      this.error(e.data);
    },
    goodbye: function (e) {
      this.goodbye(e.data);
    },
    // handle the initial handshake response from the server
    hello: function (e) {
      if (this.reconnectAttempts !== 0) {
        this.reconnectAttempts = 0;
        this.didReconnect();
      }
      this.heartbeatInterval = setInterval(this.heartbeat, e.data.heartbeat);
      this.version(e.data.JMRI);
      this.railroad(e.data.railroad);
      this.hello(e.data);
    },
    pong: function (e) {
      this.pong();
    },
    block: function (e) {
      this.block(e.data.name, e.data.value, e.data);
    },
    blocks: function (e) {
      this.blocks(e.data);
    },
    car: function (e) {
      this.car(e.data.name, e.data);
    },
    cars: function (e) {
      this.cars(e.data);
    },
    configProfile: function (e) {
      this.configProfile(e.data.name, e.data);
    },
    configProfiles: function (e) {
      this.configProfiles(e.data);
    },
    consist: function (e) {
      this.consist(e.data.name, e.data);
    },
    consists: function (e) {
      this.consists(e.data);
    },
    engine: function (e) {
      this.engine(e.data.name, e.data);
    },
    engines: function (e) {
      this.engines(e.data);
    },
    idTag: function (e) {
      this.idTag(e.data.name, e.data.state, e.data);
    },
    idTags: function (e) {
      this.idTags(e.data);
    },
    layoutBlock: function (e) {
      this.layoutBlock(e.data.name, e.data.value, e.data);
    },
    layoutBlocks: function (e) {
      this.layoutBlocks(e.data);
    },
    light: function (e) {
      this.light(e.data.name, e.data.state, e.data);
    },
    lights: function (e) {
      this.lights(e.data);
    },
    location: function (e) {
      this.location(e.data.name, e.data);
    },
    locations: function (e) {
      this.locations(e.data);
    },
    memory: function (e) {
      this.memory(e.data.name, e.data.value, e.data);
    },
    memories: function (e) {
      this.memories(e.data);
    },
    metadata: function (e) {
      this.metadata(e.data);
    },
    networkService: function (e) {
      this.networkService(e.data.name, e.data);
    },
    networkServices: function (e) {
      this.networkServices(e.data);
    },
    oblock: function (e) {
      this.oblock(e.data.name, e.data.status, e.data);
    },
    oblocks: function (e) {
      this.oblocks(e.data);
    },
    panel: function (e) {
      this.panel(e.data.name, e.data.value, e.data);
    },
    panels: function (e) {
      this.panels(e.data);
    },
    power: function (e) {
      this.power(e.data.state);
    },
    reporter: function (e) {
      this.reporter(e.data.name, e.data.value, e.data);
    },
    reporters: function (e) {
      this.reporters(e.data);
    },
    rosterEntry: function (e) {
      this.rosterEntry(e.data.name, e.data);
    },
    roster: function (e) {
      this.roster(e.data);
    },
    rosterGroup: function (e) {
      this.rosterGroup(e.data.name, e.data);
    },
    rosterGroups: function (e) {
      this.rosterGroups(e.data);
    },
    route: function (e) {
      this.route(e.data.name, e.data.state, e.data);
    },
    routes: function (e) {
      this.routes(e.data);
    },
    sensor: function (e) {
      this.sensor(e.data.name, e.data.state, e.data);
    },
    sensors: function (e) {
      this.sensors(e.data);
    },
    signalHead: function (e) {
      this.signalHead(e.data.name, e.data.state, e.data);
    },
    signalHeads: function (e) {
      this.signalHeads(e.data);
    },
    signalMast: function (e) {
      this.signalMast(e.data.name, e.data.state, e.data);
    },
    signalMasts: function (e) {
      this.signalMasts(e.data);
    },
    systemConnection: function (e) {
      this.systemConnection(e.data.name, e.data);
    },
    systemConnections: function (e) {
      this.systemConnections(e.data);
    },
    throttle: function (e) {
      this.throttle(e.data.throttle, e.data);
    },
    time: function (e) {
      this.time(e.data.time, e.data);
    },
    train: function (e) {
      this.train(e.data.name, e.data);
    },
    trains: function (e) {
      this.trains(e.data);
    },
    turnout: function (e) {
      this.turnout(e.data.name, e.data.state, e.data);
    },
    turnouts: function (e) {
      this.turnouts(e.data);
    }
  }
*/
  this.reconnect = () => {
    console.log("this.reconnect");
    this.ws_connect();

  };

  this.reconnect();
  if (this.socket === null) {
    //$("#no-websockets").addClass("show").removeClass("hidden");
  }
  /*$(window).unload(function () {
    if (this.socket != null) {
      this.socket.close();
    }
    this.socket = null;
    jmri = null;
  });*/
}

module.exports = JMRI;