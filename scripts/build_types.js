function processMessage(types, msg, name) {
  if (name) {
    if (msg.fields) {
      var typ = types[name] = {};
      var fieldNames = Object.keys(msg.fields);
      for (var i = 0; i < fieldNames.length; i++) {
        var fname = fieldNames[i];
        typ[fname] = msg.fields[fname];
      }
    } else if (msg.values) {
      var typ = types[name] = {isEnum: true};
      var valueNames = Object.keys(msg.values);
      for (var i = 0; i < valueNames.length; i++) {
        var valname = valueNames[i];
        typ[valname] = msg.values[valname];
      }
    }
  }

  if (msg.nested) {
    var nestedKeys = Object.keys(msg.nested);
    for (var i = 0; i < nestedKeys.length; i++) {
      processMessage(types, msg.nested[nestedKeys[i]], nestedKeys[i]);
    }
  }
}

if (!module.parent) {
  (function() {
    var data = "";
    var types = {};
    process.stdin.resume();
    process.stdin.on('data', function(buf) { data += buf.toString(); });
    process.stdin.on('end', function() {
      processMessage(types, JSON.parse(data), null);
      console.log(types);
    });
  })();
}

module.exports = {
  processMessage: processMessage,
};
