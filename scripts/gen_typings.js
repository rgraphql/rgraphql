var processMessage = require("./build_types.js").processMessage;

const typeMap = {
  "string": "string",
  "int32": "number",
  "uint32": "number",
  "double": "number",
  "float": "number",
  // long? XXX
  "int64": "number",
  "uint64": "number",
  "sint32": "number",
  "sint64": "number",
  "fixed32": "number",
  "fixed64": "number",
  "sfixed32": "number",
  "sfixed64": "number",
  "bool": "boolean",
  // base64? XXX
  "bytes": "Buffer",
};

function buildTypings(defs) {
  var types = {};

  processMessage(types, defs);

  // var result = "namespace Proto {\n";
  var result = "";
  for (var typen in types) {
    result += "export ";
    var type = types[typen];
    if (type.isEnum) {
      result += "const enum " + typen + " {\n";
      for (var valuen in type) {
        if (valuen === "isEnum") {
          continue;
        }
        var val = type[valuen];
        result += "  " + valuen + " = " + val + ",\n";
      }
      result += "}\n\n";
      continue;
    }

    result += "interface I" + typen + " {\n"
    for (var fieldn in type) {
      var field = type[fieldn];
      var typ = field.type;
      var typp = typ.split(".");
      typ = typp[typp.length - 1];
      var typm = typeMap[typ];
      var typit = types[typ];
      if (typm) {
        typ = typm;
      } else if (typit) {
        if (!typit.isEnum) {
          typ = "I" + typ;
        }
      } else {
        typ = "any";
      }
      if (field.rule === "repeated") {
        typ = "" + typ + "[]";
      } else if (field.rule === "map") {
        typ = `{ [key: string]: ${typ} }`;
      }
      result += "  " + fieldn + ([undefined, "map", "repeated"].indexOf(field.rule) !== -1 ? "?" : "") + ": " + typ + ";\n";
    }
    result += "}\n\n";
  }
  // result += "}";
  console.log(result);
}

(function() {
  var data = "";
  process.stdin.resume();
  process.stdin.on('data', function(buf) { data += buf.toString(); });
  process.stdin.on('end', function() {
    buildTypings(JSON.parse(data));
  });
})();
