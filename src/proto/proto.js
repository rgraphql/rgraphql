/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.rgraphql = (function() {

    /**
     * Namespace rgraphql.
     * @exports rgraphql
     * @namespace
     */
    var rgraphql = {};

    rgraphql.RGQLQueryFieldDirective = (function() {

        /**
         * Properties of a RGQLQueryFieldDirective.
         * @memberof rgraphql
         * @interface IRGQLQueryFieldDirective
         * @property {string|null} [name] RGQLQueryFieldDirective name
         * @property {Array.<rgraphql.IFieldArgument>|null} [args] RGQLQueryFieldDirective args
         */

        /**
         * Constructs a new RGQLQueryFieldDirective.
         * @memberof rgraphql
         * @classdesc Represents a RGQLQueryFieldDirective.
         * @implements IRGQLQueryFieldDirective
         * @constructor
         * @param {rgraphql.IRGQLQueryFieldDirective=} [properties] Properties to set
         */
        function RGQLQueryFieldDirective(properties) {
            this.args = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLQueryFieldDirective name.
         * @member {string} name
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @instance
         */
        RGQLQueryFieldDirective.prototype.name = "";

        /**
         * RGQLQueryFieldDirective args.
         * @member {Array.<rgraphql.IFieldArgument>} args
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @instance
         */
        RGQLQueryFieldDirective.prototype.args = $util.emptyArray;

        /**
         * Creates a new RGQLQueryFieldDirective instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {rgraphql.IRGQLQueryFieldDirective=} [properties] Properties to set
         * @returns {rgraphql.RGQLQueryFieldDirective} RGQLQueryFieldDirective instance
         */
        RGQLQueryFieldDirective.create = function create(properties) {
            return new RGQLQueryFieldDirective(properties);
        };

        /**
         * Encodes the specified RGQLQueryFieldDirective message. Does not implicitly {@link rgraphql.RGQLQueryFieldDirective.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {rgraphql.IRGQLQueryFieldDirective} message RGQLQueryFieldDirective message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryFieldDirective.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.args != null && message.args.length)
                for (var i = 0; i < message.args.length; ++i)
                    $root.rgraphql.FieldArgument.encode(message.args[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RGQLQueryFieldDirective message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryFieldDirective.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {rgraphql.IRGQLQueryFieldDirective} message RGQLQueryFieldDirective message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryFieldDirective.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLQueryFieldDirective message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLQueryFieldDirective} RGQLQueryFieldDirective
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryFieldDirective.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryFieldDirective();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    if (!(message.args && message.args.length))
                        message.args = [];
                    message.args.push($root.rgraphql.FieldArgument.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLQueryFieldDirective message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLQueryFieldDirective} RGQLQueryFieldDirective
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryFieldDirective.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLQueryFieldDirective message.
         * @function verify
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLQueryFieldDirective.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.args != null && message.hasOwnProperty("args")) {
                if (!Array.isArray(message.args))
                    return "args: array expected";
                for (var i = 0; i < message.args.length; ++i) {
                    var error = $root.rgraphql.FieldArgument.verify(message.args[i]);
                    if (error)
                        return "args." + error;
                }
            }
            return null;
        };

        /**
         * Creates a RGQLQueryFieldDirective message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLQueryFieldDirective} RGQLQueryFieldDirective
         */
        RGQLQueryFieldDirective.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLQueryFieldDirective)
                return object;
            var message = new $root.rgraphql.RGQLQueryFieldDirective();
            if (object.name != null)
                message.name = String(object.name);
            if (object.args) {
                if (!Array.isArray(object.args))
                    throw TypeError(".rgraphql.RGQLQueryFieldDirective.args: array expected");
                message.args = [];
                for (var i = 0; i < object.args.length; ++i) {
                    if (typeof object.args[i] !== "object")
                        throw TypeError(".rgraphql.RGQLQueryFieldDirective.args: object expected");
                    message.args[i] = $root.rgraphql.FieldArgument.fromObject(object.args[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a RGQLQueryFieldDirective message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @static
         * @param {rgraphql.RGQLQueryFieldDirective} message RGQLQueryFieldDirective
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLQueryFieldDirective.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.args = [];
            if (options.defaults)
                object.name = "";
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.args && message.args.length) {
                object.args = [];
                for (var j = 0; j < message.args.length; ++j)
                    object.args[j] = $root.rgraphql.FieldArgument.toObject(message.args[j], options);
            }
            return object;
        };

        /**
         * Converts this RGQLQueryFieldDirective to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLQueryFieldDirective
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLQueryFieldDirective.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLQueryFieldDirective;
    })();

    rgraphql.RGQLQueryTreeNode = (function() {

        /**
         * Properties of a RGQLQueryTreeNode.
         * @memberof rgraphql
         * @interface IRGQLQueryTreeNode
         * @property {number|null} [id] RGQLQueryTreeNode id
         * @property {string|null} [fieldName] RGQLQueryTreeNode fieldName
         * @property {Array.<rgraphql.IFieldArgument>|null} [args] RGQLQueryTreeNode args
         * @property {Array.<rgraphql.IRGQLQueryFieldDirective>|null} [directive] RGQLQueryTreeNode directive
         * @property {Array.<rgraphql.IRGQLQueryTreeNode>|null} [children] RGQLQueryTreeNode children
         */

        /**
         * Constructs a new RGQLQueryTreeNode.
         * @memberof rgraphql
         * @classdesc Represents a RGQLQueryTreeNode.
         * @implements IRGQLQueryTreeNode
         * @constructor
         * @param {rgraphql.IRGQLQueryTreeNode=} [properties] Properties to set
         */
        function RGQLQueryTreeNode(properties) {
            this.args = [];
            this.directive = [];
            this.children = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLQueryTreeNode id.
         * @member {number} id
         * @memberof rgraphql.RGQLQueryTreeNode
         * @instance
         */
        RGQLQueryTreeNode.prototype.id = 0;

        /**
         * RGQLQueryTreeNode fieldName.
         * @member {string} fieldName
         * @memberof rgraphql.RGQLQueryTreeNode
         * @instance
         */
        RGQLQueryTreeNode.prototype.fieldName = "";

        /**
         * RGQLQueryTreeNode args.
         * @member {Array.<rgraphql.IFieldArgument>} args
         * @memberof rgraphql.RGQLQueryTreeNode
         * @instance
         */
        RGQLQueryTreeNode.prototype.args = $util.emptyArray;

        /**
         * RGQLQueryTreeNode directive.
         * @member {Array.<rgraphql.IRGQLQueryFieldDirective>} directive
         * @memberof rgraphql.RGQLQueryTreeNode
         * @instance
         */
        RGQLQueryTreeNode.prototype.directive = $util.emptyArray;

        /**
         * RGQLQueryTreeNode children.
         * @member {Array.<rgraphql.IRGQLQueryTreeNode>} children
         * @memberof rgraphql.RGQLQueryTreeNode
         * @instance
         */
        RGQLQueryTreeNode.prototype.children = $util.emptyArray;

        /**
         * Creates a new RGQLQueryTreeNode instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {rgraphql.IRGQLQueryTreeNode=} [properties] Properties to set
         * @returns {rgraphql.RGQLQueryTreeNode} RGQLQueryTreeNode instance
         */
        RGQLQueryTreeNode.create = function create(properties) {
            return new RGQLQueryTreeNode(properties);
        };

        /**
         * Encodes the specified RGQLQueryTreeNode message. Does not implicitly {@link rgraphql.RGQLQueryTreeNode.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {rgraphql.IRGQLQueryTreeNode} message RGQLQueryTreeNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryTreeNode.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.fieldName != null && message.hasOwnProperty("fieldName"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.fieldName);
            if (message.args != null && message.args.length)
                for (var i = 0; i < message.args.length; ++i)
                    $root.rgraphql.FieldArgument.encode(message.args[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.directive != null && message.directive.length)
                for (var i = 0; i < message.directive.length; ++i)
                    $root.rgraphql.RGQLQueryFieldDirective.encode(message.directive[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.children != null && message.children.length)
                for (var i = 0; i < message.children.length; ++i)
                    $root.rgraphql.RGQLQueryTreeNode.encode(message.children[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RGQLQueryTreeNode message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryTreeNode.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {rgraphql.IRGQLQueryTreeNode} message RGQLQueryTreeNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryTreeNode.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLQueryTreeNode message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLQueryTreeNode} RGQLQueryTreeNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryTreeNode.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryTreeNode();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.fieldName = reader.string();
                    break;
                case 3:
                    if (!(message.args && message.args.length))
                        message.args = [];
                    message.args.push($root.rgraphql.FieldArgument.decode(reader, reader.uint32()));
                    break;
                case 4:
                    if (!(message.directive && message.directive.length))
                        message.directive = [];
                    message.directive.push($root.rgraphql.RGQLQueryFieldDirective.decode(reader, reader.uint32()));
                    break;
                case 5:
                    if (!(message.children && message.children.length))
                        message.children = [];
                    message.children.push($root.rgraphql.RGQLQueryTreeNode.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLQueryTreeNode message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLQueryTreeNode} RGQLQueryTreeNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryTreeNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLQueryTreeNode message.
         * @function verify
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLQueryTreeNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.fieldName != null && message.hasOwnProperty("fieldName"))
                if (!$util.isString(message.fieldName))
                    return "fieldName: string expected";
            if (message.args != null && message.hasOwnProperty("args")) {
                if (!Array.isArray(message.args))
                    return "args: array expected";
                for (var i = 0; i < message.args.length; ++i) {
                    var error = $root.rgraphql.FieldArgument.verify(message.args[i]);
                    if (error)
                        return "args." + error;
                }
            }
            if (message.directive != null && message.hasOwnProperty("directive")) {
                if (!Array.isArray(message.directive))
                    return "directive: array expected";
                for (var i = 0; i < message.directive.length; ++i) {
                    var error = $root.rgraphql.RGQLQueryFieldDirective.verify(message.directive[i]);
                    if (error)
                        return "directive." + error;
                }
            }
            if (message.children != null && message.hasOwnProperty("children")) {
                if (!Array.isArray(message.children))
                    return "children: array expected";
                for (var i = 0; i < message.children.length; ++i) {
                    var error = $root.rgraphql.RGQLQueryTreeNode.verify(message.children[i]);
                    if (error)
                        return "children." + error;
                }
            }
            return null;
        };

        /**
         * Creates a RGQLQueryTreeNode message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLQueryTreeNode} RGQLQueryTreeNode
         */
        RGQLQueryTreeNode.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLQueryTreeNode)
                return object;
            var message = new $root.rgraphql.RGQLQueryTreeNode();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.fieldName != null)
                message.fieldName = String(object.fieldName);
            if (object.args) {
                if (!Array.isArray(object.args))
                    throw TypeError(".rgraphql.RGQLQueryTreeNode.args: array expected");
                message.args = [];
                for (var i = 0; i < object.args.length; ++i) {
                    if (typeof object.args[i] !== "object")
                        throw TypeError(".rgraphql.RGQLQueryTreeNode.args: object expected");
                    message.args[i] = $root.rgraphql.FieldArgument.fromObject(object.args[i]);
                }
            }
            if (object.directive) {
                if (!Array.isArray(object.directive))
                    throw TypeError(".rgraphql.RGQLQueryTreeNode.directive: array expected");
                message.directive = [];
                for (var i = 0; i < object.directive.length; ++i) {
                    if (typeof object.directive[i] !== "object")
                        throw TypeError(".rgraphql.RGQLQueryTreeNode.directive: object expected");
                    message.directive[i] = $root.rgraphql.RGQLQueryFieldDirective.fromObject(object.directive[i]);
                }
            }
            if (object.children) {
                if (!Array.isArray(object.children))
                    throw TypeError(".rgraphql.RGQLQueryTreeNode.children: array expected");
                message.children = [];
                for (var i = 0; i < object.children.length; ++i) {
                    if (typeof object.children[i] !== "object")
                        throw TypeError(".rgraphql.RGQLQueryTreeNode.children: object expected");
                    message.children[i] = $root.rgraphql.RGQLQueryTreeNode.fromObject(object.children[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a RGQLQueryTreeNode message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLQueryTreeNode
         * @static
         * @param {rgraphql.RGQLQueryTreeNode} message RGQLQueryTreeNode
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLQueryTreeNode.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.args = [];
                object.directive = [];
                object.children = [];
            }
            if (options.defaults) {
                object.id = 0;
                object.fieldName = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.fieldName != null && message.hasOwnProperty("fieldName"))
                object.fieldName = message.fieldName;
            if (message.args && message.args.length) {
                object.args = [];
                for (var j = 0; j < message.args.length; ++j)
                    object.args[j] = $root.rgraphql.FieldArgument.toObject(message.args[j], options);
            }
            if (message.directive && message.directive.length) {
                object.directive = [];
                for (var j = 0; j < message.directive.length; ++j)
                    object.directive[j] = $root.rgraphql.RGQLQueryFieldDirective.toObject(message.directive[j], options);
            }
            if (message.children && message.children.length) {
                object.children = [];
                for (var j = 0; j < message.children.length; ++j)
                    object.children[j] = $root.rgraphql.RGQLQueryTreeNode.toObject(message.children[j], options);
            }
            return object;
        };

        /**
         * Converts this RGQLQueryTreeNode to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLQueryTreeNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLQueryTreeNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLQueryTreeNode;
    })();

    rgraphql.FieldArgument = (function() {

        /**
         * Properties of a FieldArgument.
         * @memberof rgraphql
         * @interface IFieldArgument
         * @property {string|null} [name] FieldArgument name
         * @property {number|null} [variableId] FieldArgument variableId
         */

        /**
         * Constructs a new FieldArgument.
         * @memberof rgraphql
         * @classdesc Represents a FieldArgument.
         * @implements IFieldArgument
         * @constructor
         * @param {rgraphql.IFieldArgument=} [properties] Properties to set
         */
        function FieldArgument(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FieldArgument name.
         * @member {string} name
         * @memberof rgraphql.FieldArgument
         * @instance
         */
        FieldArgument.prototype.name = "";

        /**
         * FieldArgument variableId.
         * @member {number} variableId
         * @memberof rgraphql.FieldArgument
         * @instance
         */
        FieldArgument.prototype.variableId = 0;

        /**
         * Creates a new FieldArgument instance using the specified properties.
         * @function create
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {rgraphql.IFieldArgument=} [properties] Properties to set
         * @returns {rgraphql.FieldArgument} FieldArgument instance
         */
        FieldArgument.create = function create(properties) {
            return new FieldArgument(properties);
        };

        /**
         * Encodes the specified FieldArgument message. Does not implicitly {@link rgraphql.FieldArgument.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {rgraphql.IFieldArgument} message FieldArgument message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FieldArgument.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.variableId != null && message.hasOwnProperty("variableId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.variableId);
            return writer;
        };

        /**
         * Encodes the specified FieldArgument message, length delimited. Does not implicitly {@link rgraphql.FieldArgument.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {rgraphql.IFieldArgument} message FieldArgument message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FieldArgument.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FieldArgument message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.FieldArgument} FieldArgument
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FieldArgument.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.FieldArgument();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.variableId = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FieldArgument message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.FieldArgument} FieldArgument
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FieldArgument.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FieldArgument message.
         * @function verify
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FieldArgument.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.variableId != null && message.hasOwnProperty("variableId"))
                if (!$util.isInteger(message.variableId))
                    return "variableId: integer expected";
            return null;
        };

        /**
         * Creates a FieldArgument message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.FieldArgument} FieldArgument
         */
        FieldArgument.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.FieldArgument)
                return object;
            var message = new $root.rgraphql.FieldArgument();
            if (object.name != null)
                message.name = String(object.name);
            if (object.variableId != null)
                message.variableId = object.variableId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a FieldArgument message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.FieldArgument
         * @static
         * @param {rgraphql.FieldArgument} message FieldArgument
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FieldArgument.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.variableId = 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.variableId != null && message.hasOwnProperty("variableId"))
                object.variableId = message.variableId;
            return object;
        };

        /**
         * Converts this FieldArgument to JSON.
         * @function toJSON
         * @memberof rgraphql.FieldArgument
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FieldArgument.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return FieldArgument;
    })();

    rgraphql.ASTVariable = (function() {

        /**
         * Properties of a ASTVariable.
         * @memberof rgraphql
         * @interface IASTVariable
         * @property {number|null} [id] ASTVariable id
         * @property {rgraphql.IRGQLPrimitive|null} [value] ASTVariable value
         */

        /**
         * Constructs a new ASTVariable.
         * @memberof rgraphql
         * @classdesc Represents a ASTVariable.
         * @implements IASTVariable
         * @constructor
         * @param {rgraphql.IASTVariable=} [properties] Properties to set
         */
        function ASTVariable(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ASTVariable id.
         * @member {number} id
         * @memberof rgraphql.ASTVariable
         * @instance
         */
        ASTVariable.prototype.id = 0;

        /**
         * ASTVariable value.
         * @member {rgraphql.IRGQLPrimitive|null|undefined} value
         * @memberof rgraphql.ASTVariable
         * @instance
         */
        ASTVariable.prototype.value = null;

        /**
         * Creates a new ASTVariable instance using the specified properties.
         * @function create
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {rgraphql.IASTVariable=} [properties] Properties to set
         * @returns {rgraphql.ASTVariable} ASTVariable instance
         */
        ASTVariable.create = function create(properties) {
            return new ASTVariable(properties);
        };

        /**
         * Encodes the specified ASTVariable message. Does not implicitly {@link rgraphql.ASTVariable.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {rgraphql.IASTVariable} message ASTVariable message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ASTVariable.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && message.hasOwnProperty("id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.value != null && message.hasOwnProperty("value"))
                $root.rgraphql.RGQLPrimitive.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ASTVariable message, length delimited. Does not implicitly {@link rgraphql.ASTVariable.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {rgraphql.IASTVariable} message ASTVariable message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ASTVariable.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ASTVariable message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.ASTVariable} ASTVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ASTVariable.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.ASTVariable();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.value = $root.rgraphql.RGQLPrimitive.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ASTVariable message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.ASTVariable} ASTVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ASTVariable.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ASTVariable message.
         * @function verify
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ASTVariable.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.value != null && message.hasOwnProperty("value")) {
                var error = $root.rgraphql.RGQLPrimitive.verify(message.value);
                if (error)
                    return "value." + error;
            }
            return null;
        };

        /**
         * Creates a ASTVariable message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.ASTVariable} ASTVariable
         */
        ASTVariable.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.ASTVariable)
                return object;
            var message = new $root.rgraphql.ASTVariable();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.value != null) {
                if (typeof object.value !== "object")
                    throw TypeError(".rgraphql.ASTVariable.value: object expected");
                message.value = $root.rgraphql.RGQLPrimitive.fromObject(object.value);
            }
            return message;
        };

        /**
         * Creates a plain object from a ASTVariable message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.ASTVariable
         * @static
         * @param {rgraphql.ASTVariable} message ASTVariable
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ASTVariable.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = 0;
                object.value = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = $root.rgraphql.RGQLPrimitive.toObject(message.value, options);
            return object;
        };

        /**
         * Converts this ASTVariable to JSON.
         * @function toJSON
         * @memberof rgraphql.ASTVariable
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ASTVariable.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ASTVariable;
    })();

    rgraphql.RGQLPrimitive = (function() {

        /**
         * Properties of a RGQLPrimitive.
         * @memberof rgraphql
         * @interface IRGQLPrimitive
         * @property {rgraphql.RGQLPrimitive.Kind|null} [kind] RGQLPrimitive kind
         * @property {number|null} [intValue] RGQLPrimitive intValue
         * @property {number|null} [floatValue] RGQLPrimitive floatValue
         * @property {string|null} [stringValue] RGQLPrimitive stringValue
         * @property {boolean|null} [boolValue] RGQLPrimitive boolValue
         */

        /**
         * Constructs a new RGQLPrimitive.
         * @memberof rgraphql
         * @classdesc Represents a RGQLPrimitive.
         * @implements IRGQLPrimitive
         * @constructor
         * @param {rgraphql.IRGQLPrimitive=} [properties] Properties to set
         */
        function RGQLPrimitive(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLPrimitive kind.
         * @member {rgraphql.RGQLPrimitive.Kind} kind
         * @memberof rgraphql.RGQLPrimitive
         * @instance
         */
        RGQLPrimitive.prototype.kind = 0;

        /**
         * RGQLPrimitive intValue.
         * @member {number} intValue
         * @memberof rgraphql.RGQLPrimitive
         * @instance
         */
        RGQLPrimitive.prototype.intValue = 0;

        /**
         * RGQLPrimitive floatValue.
         * @member {number} floatValue
         * @memberof rgraphql.RGQLPrimitive
         * @instance
         */
        RGQLPrimitive.prototype.floatValue = 0;

        /**
         * RGQLPrimitive stringValue.
         * @member {string} stringValue
         * @memberof rgraphql.RGQLPrimitive
         * @instance
         */
        RGQLPrimitive.prototype.stringValue = "";

        /**
         * RGQLPrimitive boolValue.
         * @member {boolean} boolValue
         * @memberof rgraphql.RGQLPrimitive
         * @instance
         */
        RGQLPrimitive.prototype.boolValue = false;

        /**
         * Creates a new RGQLPrimitive instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {rgraphql.IRGQLPrimitive=} [properties] Properties to set
         * @returns {rgraphql.RGQLPrimitive} RGQLPrimitive instance
         */
        RGQLPrimitive.create = function create(properties) {
            return new RGQLPrimitive(properties);
        };

        /**
         * Encodes the specified RGQLPrimitive message. Does not implicitly {@link rgraphql.RGQLPrimitive.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {rgraphql.IRGQLPrimitive} message RGQLPrimitive message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLPrimitive.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.kind != null && message.hasOwnProperty("kind"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.kind);
            if (message.intValue != null && message.hasOwnProperty("intValue"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.intValue);
            if (message.floatValue != null && message.hasOwnProperty("floatValue"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.floatValue);
            if (message.stringValue != null && message.hasOwnProperty("stringValue"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.stringValue);
            if (message.boolValue != null && message.hasOwnProperty("boolValue"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.boolValue);
            return writer;
        };

        /**
         * Encodes the specified RGQLPrimitive message, length delimited. Does not implicitly {@link rgraphql.RGQLPrimitive.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {rgraphql.IRGQLPrimitive} message RGQLPrimitive message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLPrimitive.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLPrimitive message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLPrimitive} RGQLPrimitive
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLPrimitive.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLPrimitive();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.kind = reader.int32();
                    break;
                case 2:
                    message.intValue = reader.int32();
                    break;
                case 3:
                    message.floatValue = reader.double();
                    break;
                case 4:
                    message.stringValue = reader.string();
                    break;
                case 5:
                    message.boolValue = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLPrimitive message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLPrimitive} RGQLPrimitive
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLPrimitive.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLPrimitive message.
         * @function verify
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLPrimitive.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.kind != null && message.hasOwnProperty("kind"))
                switch (message.kind) {
                default:
                    return "kind: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.intValue != null && message.hasOwnProperty("intValue"))
                if (!$util.isInteger(message.intValue))
                    return "intValue: integer expected";
            if (message.floatValue != null && message.hasOwnProperty("floatValue"))
                if (typeof message.floatValue !== "number")
                    return "floatValue: number expected";
            if (message.stringValue != null && message.hasOwnProperty("stringValue"))
                if (!$util.isString(message.stringValue))
                    return "stringValue: string expected";
            if (message.boolValue != null && message.hasOwnProperty("boolValue"))
                if (typeof message.boolValue !== "boolean")
                    return "boolValue: boolean expected";
            return null;
        };

        /**
         * Creates a RGQLPrimitive message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLPrimitive} RGQLPrimitive
         */
        RGQLPrimitive.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLPrimitive)
                return object;
            var message = new $root.rgraphql.RGQLPrimitive();
            switch (object.kind) {
            case "PRIMITIVE_KIND_NULL":
            case 0:
                message.kind = 0;
                break;
            case "PRIMITIVE_KIND_INT":
            case 1:
                message.kind = 1;
                break;
            case "PRIMITIVE_KIND_FLOAT":
            case 2:
                message.kind = 2;
                break;
            case "PRIMITIVE_KIND_STRING":
            case 3:
                message.kind = 3;
                break;
            case "PRIMITIVE_KIND_BOOL":
            case 4:
                message.kind = 4;
                break;
            case "PRIMITIVE_KIND_OBJECT":
            case 5:
                message.kind = 5;
                break;
            case "PRIMITIVE_KIND_ARRAY":
            case 6:
                message.kind = 6;
                break;
            }
            if (object.intValue != null)
                message.intValue = object.intValue | 0;
            if (object.floatValue != null)
                message.floatValue = Number(object.floatValue);
            if (object.stringValue != null)
                message.stringValue = String(object.stringValue);
            if (object.boolValue != null)
                message.boolValue = Boolean(object.boolValue);
            return message;
        };

        /**
         * Creates a plain object from a RGQLPrimitive message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLPrimitive
         * @static
         * @param {rgraphql.RGQLPrimitive} message RGQLPrimitive
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLPrimitive.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.kind = options.enums === String ? "PRIMITIVE_KIND_NULL" : 0;
                object.intValue = 0;
                object.floatValue = 0;
                object.stringValue = "";
                object.boolValue = false;
            }
            if (message.kind != null && message.hasOwnProperty("kind"))
                object.kind = options.enums === String ? $root.rgraphql.RGQLPrimitive.Kind[message.kind] : message.kind;
            if (message.intValue != null && message.hasOwnProperty("intValue"))
                object.intValue = message.intValue;
            if (message.floatValue != null && message.hasOwnProperty("floatValue"))
                object.floatValue = options.json && !isFinite(message.floatValue) ? String(message.floatValue) : message.floatValue;
            if (message.stringValue != null && message.hasOwnProperty("stringValue"))
                object.stringValue = message.stringValue;
            if (message.boolValue != null && message.hasOwnProperty("boolValue"))
                object.boolValue = message.boolValue;
            return object;
        };

        /**
         * Converts this RGQLPrimitive to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLPrimitive
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLPrimitive.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Kind enum.
         * @name rgraphql.RGQLPrimitive.Kind
         * @enum {string}
         * @property {number} PRIMITIVE_KIND_NULL=0 PRIMITIVE_KIND_NULL value
         * @property {number} PRIMITIVE_KIND_INT=1 PRIMITIVE_KIND_INT value
         * @property {number} PRIMITIVE_KIND_FLOAT=2 PRIMITIVE_KIND_FLOAT value
         * @property {number} PRIMITIVE_KIND_STRING=3 PRIMITIVE_KIND_STRING value
         * @property {number} PRIMITIVE_KIND_BOOL=4 PRIMITIVE_KIND_BOOL value
         * @property {number} PRIMITIVE_KIND_OBJECT=5 PRIMITIVE_KIND_OBJECT value
         * @property {number} PRIMITIVE_KIND_ARRAY=6 PRIMITIVE_KIND_ARRAY value
         */
        RGQLPrimitive.Kind = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "PRIMITIVE_KIND_NULL"] = 0;
            values[valuesById[1] = "PRIMITIVE_KIND_INT"] = 1;
            values[valuesById[2] = "PRIMITIVE_KIND_FLOAT"] = 2;
            values[valuesById[3] = "PRIMITIVE_KIND_STRING"] = 3;
            values[valuesById[4] = "PRIMITIVE_KIND_BOOL"] = 4;
            values[valuesById[5] = "PRIMITIVE_KIND_OBJECT"] = 5;
            values[valuesById[6] = "PRIMITIVE_KIND_ARRAY"] = 6;
            return values;
        })();

        return RGQLPrimitive;
    })();

    rgraphql.RGQLClientMessage = (function() {

        /**
         * Properties of a RGQLClientMessage.
         * @memberof rgraphql
         * @interface IRGQLClientMessage
         * @property {rgraphql.IRGQLQueryInit|null} [initQuery] RGQLClientMessage initQuery
         * @property {rgraphql.IRGQLQueryTreeMutation|null} [mutateTree] RGQLClientMessage mutateTree
         * @property {rgraphql.IRGQLQueryFinish|null} [finishQuery] RGQLClientMessage finishQuery
         */

        /**
         * Constructs a new RGQLClientMessage.
         * @memberof rgraphql
         * @classdesc Represents a RGQLClientMessage.
         * @implements IRGQLClientMessage
         * @constructor
         * @param {rgraphql.IRGQLClientMessage=} [properties] Properties to set
         */
        function RGQLClientMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLClientMessage initQuery.
         * @member {rgraphql.IRGQLQueryInit|null|undefined} initQuery
         * @memberof rgraphql.RGQLClientMessage
         * @instance
         */
        RGQLClientMessage.prototype.initQuery = null;

        /**
         * RGQLClientMessage mutateTree.
         * @member {rgraphql.IRGQLQueryTreeMutation|null|undefined} mutateTree
         * @memberof rgraphql.RGQLClientMessage
         * @instance
         */
        RGQLClientMessage.prototype.mutateTree = null;

        /**
         * RGQLClientMessage finishQuery.
         * @member {rgraphql.IRGQLQueryFinish|null|undefined} finishQuery
         * @memberof rgraphql.RGQLClientMessage
         * @instance
         */
        RGQLClientMessage.prototype.finishQuery = null;

        /**
         * Creates a new RGQLClientMessage instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {rgraphql.IRGQLClientMessage=} [properties] Properties to set
         * @returns {rgraphql.RGQLClientMessage} RGQLClientMessage instance
         */
        RGQLClientMessage.create = function create(properties) {
            return new RGQLClientMessage(properties);
        };

        /**
         * Encodes the specified RGQLClientMessage message. Does not implicitly {@link rgraphql.RGQLClientMessage.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {rgraphql.IRGQLClientMessage} message RGQLClientMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLClientMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.initQuery != null && message.hasOwnProperty("initQuery"))
                $root.rgraphql.RGQLQueryInit.encode(message.initQuery, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.mutateTree != null && message.hasOwnProperty("mutateTree"))
                $root.rgraphql.RGQLQueryTreeMutation.encode(message.mutateTree, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.finishQuery != null && message.hasOwnProperty("finishQuery"))
                $root.rgraphql.RGQLQueryFinish.encode(message.finishQuery, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RGQLClientMessage message, length delimited. Does not implicitly {@link rgraphql.RGQLClientMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {rgraphql.IRGQLClientMessage} message RGQLClientMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLClientMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLClientMessage message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLClientMessage} RGQLClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLClientMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLClientMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.initQuery = $root.rgraphql.RGQLQueryInit.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.mutateTree = $root.rgraphql.RGQLQueryTreeMutation.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.finishQuery = $root.rgraphql.RGQLQueryFinish.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLClientMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLClientMessage} RGQLClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLClientMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLClientMessage message.
         * @function verify
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLClientMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.initQuery != null && message.hasOwnProperty("initQuery")) {
                var error = $root.rgraphql.RGQLQueryInit.verify(message.initQuery);
                if (error)
                    return "initQuery." + error;
            }
            if (message.mutateTree != null && message.hasOwnProperty("mutateTree")) {
                var error = $root.rgraphql.RGQLQueryTreeMutation.verify(message.mutateTree);
                if (error)
                    return "mutateTree." + error;
            }
            if (message.finishQuery != null && message.hasOwnProperty("finishQuery")) {
                var error = $root.rgraphql.RGQLQueryFinish.verify(message.finishQuery);
                if (error)
                    return "finishQuery." + error;
            }
            return null;
        };

        /**
         * Creates a RGQLClientMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLClientMessage} RGQLClientMessage
         */
        RGQLClientMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLClientMessage)
                return object;
            var message = new $root.rgraphql.RGQLClientMessage();
            if (object.initQuery != null) {
                if (typeof object.initQuery !== "object")
                    throw TypeError(".rgraphql.RGQLClientMessage.initQuery: object expected");
                message.initQuery = $root.rgraphql.RGQLQueryInit.fromObject(object.initQuery);
            }
            if (object.mutateTree != null) {
                if (typeof object.mutateTree !== "object")
                    throw TypeError(".rgraphql.RGQLClientMessage.mutateTree: object expected");
                message.mutateTree = $root.rgraphql.RGQLQueryTreeMutation.fromObject(object.mutateTree);
            }
            if (object.finishQuery != null) {
                if (typeof object.finishQuery !== "object")
                    throw TypeError(".rgraphql.RGQLClientMessage.finishQuery: object expected");
                message.finishQuery = $root.rgraphql.RGQLQueryFinish.fromObject(object.finishQuery);
            }
            return message;
        };

        /**
         * Creates a plain object from a RGQLClientMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLClientMessage
         * @static
         * @param {rgraphql.RGQLClientMessage} message RGQLClientMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLClientMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.initQuery = null;
                object.mutateTree = null;
                object.finishQuery = null;
            }
            if (message.initQuery != null && message.hasOwnProperty("initQuery"))
                object.initQuery = $root.rgraphql.RGQLQueryInit.toObject(message.initQuery, options);
            if (message.mutateTree != null && message.hasOwnProperty("mutateTree"))
                object.mutateTree = $root.rgraphql.RGQLQueryTreeMutation.toObject(message.mutateTree, options);
            if (message.finishQuery != null && message.hasOwnProperty("finishQuery"))
                object.finishQuery = $root.rgraphql.RGQLQueryFinish.toObject(message.finishQuery, options);
            return object;
        };

        /**
         * Converts this RGQLClientMessage to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLClientMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLClientMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLClientMessage;
    })();

    rgraphql.RGQLQueryInit = (function() {

        /**
         * Properties of a RGQLQueryInit.
         * @memberof rgraphql
         * @interface IRGQLQueryInit
         * @property {number|null} [queryId] RGQLQueryInit queryId
         * @property {boolean|null} [forceSerial] RGQLQueryInit forceSerial
         * @property {string|null} [operationType] RGQLQueryInit operationType
         */

        /**
         * Constructs a new RGQLQueryInit.
         * @memberof rgraphql
         * @classdesc Represents a RGQLQueryInit.
         * @implements IRGQLQueryInit
         * @constructor
         * @param {rgraphql.IRGQLQueryInit=} [properties] Properties to set
         */
        function RGQLQueryInit(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLQueryInit queryId.
         * @member {number} queryId
         * @memberof rgraphql.RGQLQueryInit
         * @instance
         */
        RGQLQueryInit.prototype.queryId = 0;

        /**
         * RGQLQueryInit forceSerial.
         * @member {boolean} forceSerial
         * @memberof rgraphql.RGQLQueryInit
         * @instance
         */
        RGQLQueryInit.prototype.forceSerial = false;

        /**
         * RGQLQueryInit operationType.
         * @member {string} operationType
         * @memberof rgraphql.RGQLQueryInit
         * @instance
         */
        RGQLQueryInit.prototype.operationType = "";

        /**
         * Creates a new RGQLQueryInit instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {rgraphql.IRGQLQueryInit=} [properties] Properties to set
         * @returns {rgraphql.RGQLQueryInit} RGQLQueryInit instance
         */
        RGQLQueryInit.create = function create(properties) {
            return new RGQLQueryInit(properties);
        };

        /**
         * Encodes the specified RGQLQueryInit message. Does not implicitly {@link rgraphql.RGQLQueryInit.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {rgraphql.IRGQLQueryInit} message RGQLQueryInit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryInit.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.queryId);
            if (message.forceSerial != null && message.hasOwnProperty("forceSerial"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.forceSerial);
            if (message.operationType != null && message.hasOwnProperty("operationType"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.operationType);
            return writer;
        };

        /**
         * Encodes the specified RGQLQueryInit message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryInit.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {rgraphql.IRGQLQueryInit} message RGQLQueryInit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryInit.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLQueryInit message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLQueryInit} RGQLQueryInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryInit.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryInit();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.queryId = reader.uint32();
                    break;
                case 2:
                    message.forceSerial = reader.bool();
                    break;
                case 3:
                    message.operationType = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLQueryInit message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLQueryInit} RGQLQueryInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryInit.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLQueryInit message.
         * @function verify
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLQueryInit.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId))
                    return "queryId: integer expected";
            if (message.forceSerial != null && message.hasOwnProperty("forceSerial"))
                if (typeof message.forceSerial !== "boolean")
                    return "forceSerial: boolean expected";
            if (message.operationType != null && message.hasOwnProperty("operationType"))
                if (!$util.isString(message.operationType))
                    return "operationType: string expected";
            return null;
        };

        /**
         * Creates a RGQLQueryInit message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLQueryInit} RGQLQueryInit
         */
        RGQLQueryInit.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLQueryInit)
                return object;
            var message = new $root.rgraphql.RGQLQueryInit();
            if (object.queryId != null)
                message.queryId = object.queryId >>> 0;
            if (object.forceSerial != null)
                message.forceSerial = Boolean(object.forceSerial);
            if (object.operationType != null)
                message.operationType = String(object.operationType);
            return message;
        };

        /**
         * Creates a plain object from a RGQLQueryInit message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLQueryInit
         * @static
         * @param {rgraphql.RGQLQueryInit} message RGQLQueryInit
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLQueryInit.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.queryId = 0;
                object.forceSerial = false;
                object.operationType = "";
            }
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                object.queryId = message.queryId;
            if (message.forceSerial != null && message.hasOwnProperty("forceSerial"))
                object.forceSerial = message.forceSerial;
            if (message.operationType != null && message.hasOwnProperty("operationType"))
                object.operationType = message.operationType;
            return object;
        };

        /**
         * Converts this RGQLQueryInit to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLQueryInit
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLQueryInit.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLQueryInit;
    })();

    rgraphql.RGQLQueryTreeMutation = (function() {

        /**
         * Properties of a RGQLQueryTreeMutation.
         * @memberof rgraphql
         * @interface IRGQLQueryTreeMutation
         * @property {number|null} [queryId] RGQLQueryTreeMutation queryId
         * @property {Array.<rgraphql.RGQLQueryTreeMutation.INodeMutation>|null} [nodeMutation] RGQLQueryTreeMutation nodeMutation
         * @property {Array.<rgraphql.IASTVariable>|null} [variables] RGQLQueryTreeMutation variables
         */

        /**
         * Constructs a new RGQLQueryTreeMutation.
         * @memberof rgraphql
         * @classdesc Represents a RGQLQueryTreeMutation.
         * @implements IRGQLQueryTreeMutation
         * @constructor
         * @param {rgraphql.IRGQLQueryTreeMutation=} [properties] Properties to set
         */
        function RGQLQueryTreeMutation(properties) {
            this.nodeMutation = [];
            this.variables = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLQueryTreeMutation queryId.
         * @member {number} queryId
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @instance
         */
        RGQLQueryTreeMutation.prototype.queryId = 0;

        /**
         * RGQLQueryTreeMutation nodeMutation.
         * @member {Array.<rgraphql.RGQLQueryTreeMutation.INodeMutation>} nodeMutation
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @instance
         */
        RGQLQueryTreeMutation.prototype.nodeMutation = $util.emptyArray;

        /**
         * RGQLQueryTreeMutation variables.
         * @member {Array.<rgraphql.IASTVariable>} variables
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @instance
         */
        RGQLQueryTreeMutation.prototype.variables = $util.emptyArray;

        /**
         * Creates a new RGQLQueryTreeMutation instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {rgraphql.IRGQLQueryTreeMutation=} [properties] Properties to set
         * @returns {rgraphql.RGQLQueryTreeMutation} RGQLQueryTreeMutation instance
         */
        RGQLQueryTreeMutation.create = function create(properties) {
            return new RGQLQueryTreeMutation(properties);
        };

        /**
         * Encodes the specified RGQLQueryTreeMutation message. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {rgraphql.IRGQLQueryTreeMutation} message RGQLQueryTreeMutation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryTreeMutation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.queryId);
            if (message.nodeMutation != null && message.nodeMutation.length)
                for (var i = 0; i < message.nodeMutation.length; ++i)
                    $root.rgraphql.RGQLQueryTreeMutation.NodeMutation.encode(message.nodeMutation[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.variables != null && message.variables.length)
                for (var i = 0; i < message.variables.length; ++i)
                    $root.rgraphql.ASTVariable.encode(message.variables[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RGQLQueryTreeMutation message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {rgraphql.IRGQLQueryTreeMutation} message RGQLQueryTreeMutation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryTreeMutation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLQueryTreeMutation message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLQueryTreeMutation} RGQLQueryTreeMutation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryTreeMutation.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryTreeMutation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.queryId = reader.uint32();
                    break;
                case 2:
                    if (!(message.nodeMutation && message.nodeMutation.length))
                        message.nodeMutation = [];
                    message.nodeMutation.push($root.rgraphql.RGQLQueryTreeMutation.NodeMutation.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.variables && message.variables.length))
                        message.variables = [];
                    message.variables.push($root.rgraphql.ASTVariable.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLQueryTreeMutation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLQueryTreeMutation} RGQLQueryTreeMutation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryTreeMutation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLQueryTreeMutation message.
         * @function verify
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLQueryTreeMutation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId))
                    return "queryId: integer expected";
            if (message.nodeMutation != null && message.hasOwnProperty("nodeMutation")) {
                if (!Array.isArray(message.nodeMutation))
                    return "nodeMutation: array expected";
                for (var i = 0; i < message.nodeMutation.length; ++i) {
                    var error = $root.rgraphql.RGQLQueryTreeMutation.NodeMutation.verify(message.nodeMutation[i]);
                    if (error)
                        return "nodeMutation." + error;
                }
            }
            if (message.variables != null && message.hasOwnProperty("variables")) {
                if (!Array.isArray(message.variables))
                    return "variables: array expected";
                for (var i = 0; i < message.variables.length; ++i) {
                    var error = $root.rgraphql.ASTVariable.verify(message.variables[i]);
                    if (error)
                        return "variables." + error;
                }
            }
            return null;
        };

        /**
         * Creates a RGQLQueryTreeMutation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLQueryTreeMutation} RGQLQueryTreeMutation
         */
        RGQLQueryTreeMutation.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLQueryTreeMutation)
                return object;
            var message = new $root.rgraphql.RGQLQueryTreeMutation();
            if (object.queryId != null)
                message.queryId = object.queryId >>> 0;
            if (object.nodeMutation) {
                if (!Array.isArray(object.nodeMutation))
                    throw TypeError(".rgraphql.RGQLQueryTreeMutation.nodeMutation: array expected");
                message.nodeMutation = [];
                for (var i = 0; i < object.nodeMutation.length; ++i) {
                    if (typeof object.nodeMutation[i] !== "object")
                        throw TypeError(".rgraphql.RGQLQueryTreeMutation.nodeMutation: object expected");
                    message.nodeMutation[i] = $root.rgraphql.RGQLQueryTreeMutation.NodeMutation.fromObject(object.nodeMutation[i]);
                }
            }
            if (object.variables) {
                if (!Array.isArray(object.variables))
                    throw TypeError(".rgraphql.RGQLQueryTreeMutation.variables: array expected");
                message.variables = [];
                for (var i = 0; i < object.variables.length; ++i) {
                    if (typeof object.variables[i] !== "object")
                        throw TypeError(".rgraphql.RGQLQueryTreeMutation.variables: object expected");
                    message.variables[i] = $root.rgraphql.ASTVariable.fromObject(object.variables[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a RGQLQueryTreeMutation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @static
         * @param {rgraphql.RGQLQueryTreeMutation} message RGQLQueryTreeMutation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLQueryTreeMutation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.nodeMutation = [];
                object.variables = [];
            }
            if (options.defaults)
                object.queryId = 0;
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                object.queryId = message.queryId;
            if (message.nodeMutation && message.nodeMutation.length) {
                object.nodeMutation = [];
                for (var j = 0; j < message.nodeMutation.length; ++j)
                    object.nodeMutation[j] = $root.rgraphql.RGQLQueryTreeMutation.NodeMutation.toObject(message.nodeMutation[j], options);
            }
            if (message.variables && message.variables.length) {
                object.variables = [];
                for (var j = 0; j < message.variables.length; ++j)
                    object.variables[j] = $root.rgraphql.ASTVariable.toObject(message.variables[j], options);
            }
            return object;
        };

        /**
         * Converts this RGQLQueryTreeMutation to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLQueryTreeMutation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLQueryTreeMutation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        RGQLQueryTreeMutation.NodeMutation = (function() {

            /**
             * Properties of a NodeMutation.
             * @memberof rgraphql.RGQLQueryTreeMutation
             * @interface INodeMutation
             * @property {number|null} [nodeId] NodeMutation nodeId
             * @property {rgraphql.RGQLQueryTreeMutation.SubtreeOperation|null} [operation] NodeMutation operation
             * @property {rgraphql.IRGQLQueryTreeNode|null} [node] NodeMutation node
             */

            /**
             * Constructs a new NodeMutation.
             * @memberof rgraphql.RGQLQueryTreeMutation
             * @classdesc Represents a NodeMutation.
             * @implements INodeMutation
             * @constructor
             * @param {rgraphql.RGQLQueryTreeMutation.INodeMutation=} [properties] Properties to set
             */
            function NodeMutation(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NodeMutation nodeId.
             * @member {number} nodeId
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @instance
             */
            NodeMutation.prototype.nodeId = 0;

            /**
             * NodeMutation operation.
             * @member {rgraphql.RGQLQueryTreeMutation.SubtreeOperation} operation
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @instance
             */
            NodeMutation.prototype.operation = 0;

            /**
             * NodeMutation node.
             * @member {rgraphql.IRGQLQueryTreeNode|null|undefined} node
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @instance
             */
            NodeMutation.prototype.node = null;

            /**
             * Creates a new NodeMutation instance using the specified properties.
             * @function create
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {rgraphql.RGQLQueryTreeMutation.INodeMutation=} [properties] Properties to set
             * @returns {rgraphql.RGQLQueryTreeMutation.NodeMutation} NodeMutation instance
             */
            NodeMutation.create = function create(properties) {
                return new NodeMutation(properties);
            };

            /**
             * Encodes the specified NodeMutation message. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.NodeMutation.verify|verify} messages.
             * @function encode
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {rgraphql.RGQLQueryTreeMutation.INodeMutation} message NodeMutation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeMutation.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.nodeId);
                if (message.operation != null && message.hasOwnProperty("operation"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.operation);
                if (message.node != null && message.hasOwnProperty("node"))
                    $root.rgraphql.RGQLQueryTreeNode.encode(message.node, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified NodeMutation message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.NodeMutation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {rgraphql.RGQLQueryTreeMutation.INodeMutation} message NodeMutation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NodeMutation.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NodeMutation message from the specified reader or buffer.
             * @function decode
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {rgraphql.RGQLQueryTreeMutation.NodeMutation} NodeMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeMutation.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryTreeMutation.NodeMutation();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.nodeId = reader.uint32();
                        break;
                    case 2:
                        message.operation = reader.int32();
                        break;
                    case 3:
                        message.node = $root.rgraphql.RGQLQueryTreeNode.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NodeMutation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {rgraphql.RGQLQueryTreeMutation.NodeMutation} NodeMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NodeMutation.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NodeMutation message.
             * @function verify
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NodeMutation.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                    if (!$util.isInteger(message.nodeId))
                        return "nodeId: integer expected";
                if (message.operation != null && message.hasOwnProperty("operation"))
                    switch (message.operation) {
                    default:
                        return "operation: enum value expected";
                    case 0:
                    case 1:
                        break;
                    }
                if (message.node != null && message.hasOwnProperty("node")) {
                    var error = $root.rgraphql.RGQLQueryTreeNode.verify(message.node);
                    if (error)
                        return "node." + error;
                }
                return null;
            };

            /**
             * Creates a NodeMutation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {rgraphql.RGQLQueryTreeMutation.NodeMutation} NodeMutation
             */
            NodeMutation.fromObject = function fromObject(object) {
                if (object instanceof $root.rgraphql.RGQLQueryTreeMutation.NodeMutation)
                    return object;
                var message = new $root.rgraphql.RGQLQueryTreeMutation.NodeMutation();
                if (object.nodeId != null)
                    message.nodeId = object.nodeId >>> 0;
                switch (object.operation) {
                case "SUBTREE_ADD_CHILD":
                case 0:
                    message.operation = 0;
                    break;
                case "SUBTREE_DELETE":
                case 1:
                    message.operation = 1;
                    break;
                }
                if (object.node != null) {
                    if (typeof object.node !== "object")
                        throw TypeError(".rgraphql.RGQLQueryTreeMutation.NodeMutation.node: object expected");
                    message.node = $root.rgraphql.RGQLQueryTreeNode.fromObject(object.node);
                }
                return message;
            };

            /**
             * Creates a plain object from a NodeMutation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @static
             * @param {rgraphql.RGQLQueryTreeMutation.NodeMutation} message NodeMutation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NodeMutation.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.nodeId = 0;
                    object.operation = options.enums === String ? "SUBTREE_ADD_CHILD" : 0;
                    object.node = null;
                }
                if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                    object.nodeId = message.nodeId;
                if (message.operation != null && message.hasOwnProperty("operation"))
                    object.operation = options.enums === String ? $root.rgraphql.RGQLQueryTreeMutation.SubtreeOperation[message.operation] : message.operation;
                if (message.node != null && message.hasOwnProperty("node"))
                    object.node = $root.rgraphql.RGQLQueryTreeNode.toObject(message.node, options);
                return object;
            };

            /**
             * Converts this NodeMutation to JSON.
             * @function toJSON
             * @memberof rgraphql.RGQLQueryTreeMutation.NodeMutation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NodeMutation.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return NodeMutation;
        })();

        /**
         * SubtreeOperation enum.
         * @name rgraphql.RGQLQueryTreeMutation.SubtreeOperation
         * @enum {string}
         * @property {number} SUBTREE_ADD_CHILD=0 SUBTREE_ADD_CHILD value
         * @property {number} SUBTREE_DELETE=1 SUBTREE_DELETE value
         */
        RGQLQueryTreeMutation.SubtreeOperation = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "SUBTREE_ADD_CHILD"] = 0;
            values[valuesById[1] = "SUBTREE_DELETE"] = 1;
            return values;
        })();

        return RGQLQueryTreeMutation;
    })();

    rgraphql.RGQLQueryFinish = (function() {

        /**
         * Properties of a RGQLQueryFinish.
         * @memberof rgraphql
         * @interface IRGQLQueryFinish
         * @property {number|null} [queryId] RGQLQueryFinish queryId
         */

        /**
         * Constructs a new RGQLQueryFinish.
         * @memberof rgraphql
         * @classdesc Represents a RGQLQueryFinish.
         * @implements IRGQLQueryFinish
         * @constructor
         * @param {rgraphql.IRGQLQueryFinish=} [properties] Properties to set
         */
        function RGQLQueryFinish(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLQueryFinish queryId.
         * @member {number} queryId
         * @memberof rgraphql.RGQLQueryFinish
         * @instance
         */
        RGQLQueryFinish.prototype.queryId = 0;

        /**
         * Creates a new RGQLQueryFinish instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {rgraphql.IRGQLQueryFinish=} [properties] Properties to set
         * @returns {rgraphql.RGQLQueryFinish} RGQLQueryFinish instance
         */
        RGQLQueryFinish.create = function create(properties) {
            return new RGQLQueryFinish(properties);
        };

        /**
         * Encodes the specified RGQLQueryFinish message. Does not implicitly {@link rgraphql.RGQLQueryFinish.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {rgraphql.IRGQLQueryFinish} message RGQLQueryFinish message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryFinish.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.queryId);
            return writer;
        };

        /**
         * Encodes the specified RGQLQueryFinish message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryFinish.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {rgraphql.IRGQLQueryFinish} message RGQLQueryFinish message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryFinish.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLQueryFinish message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLQueryFinish} RGQLQueryFinish
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryFinish.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryFinish();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.queryId = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLQueryFinish message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLQueryFinish} RGQLQueryFinish
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryFinish.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLQueryFinish message.
         * @function verify
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLQueryFinish.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId))
                    return "queryId: integer expected";
            return null;
        };

        /**
         * Creates a RGQLQueryFinish message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLQueryFinish} RGQLQueryFinish
         */
        RGQLQueryFinish.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLQueryFinish)
                return object;
            var message = new $root.rgraphql.RGQLQueryFinish();
            if (object.queryId != null)
                message.queryId = object.queryId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a RGQLQueryFinish message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLQueryFinish
         * @static
         * @param {rgraphql.RGQLQueryFinish} message RGQLQueryFinish
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLQueryFinish.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.queryId = 0;
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                object.queryId = message.queryId;
            return object;
        };

        /**
         * Converts this RGQLQueryFinish to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLQueryFinish
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLQueryFinish.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLQueryFinish;
    })();

    rgraphql.RGQLServerMessage = (function() {

        /**
         * Properties of a RGQLServerMessage.
         * @memberof rgraphql
         * @interface IRGQLServerMessage
         * @property {rgraphql.IRGQLQueryError|null} [queryError] RGQLServerMessage queryError
         * @property {rgraphql.IRGQLValueInit|null} [valueInit] RGQLServerMessage valueInit
         * @property {rgraphql.IRGQLValueBatch|null} [valueBatch] RGQLServerMessage valueBatch
         * @property {rgraphql.IRGQLValueFinalize|null} [valueFinalize] RGQLServerMessage valueFinalize
         */

        /**
         * Constructs a new RGQLServerMessage.
         * @memberof rgraphql
         * @classdesc Represents a RGQLServerMessage.
         * @implements IRGQLServerMessage
         * @constructor
         * @param {rgraphql.IRGQLServerMessage=} [properties] Properties to set
         */
        function RGQLServerMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLServerMessage queryError.
         * @member {rgraphql.IRGQLQueryError|null|undefined} queryError
         * @memberof rgraphql.RGQLServerMessage
         * @instance
         */
        RGQLServerMessage.prototype.queryError = null;

        /**
         * RGQLServerMessage valueInit.
         * @member {rgraphql.IRGQLValueInit|null|undefined} valueInit
         * @memberof rgraphql.RGQLServerMessage
         * @instance
         */
        RGQLServerMessage.prototype.valueInit = null;

        /**
         * RGQLServerMessage valueBatch.
         * @member {rgraphql.IRGQLValueBatch|null|undefined} valueBatch
         * @memberof rgraphql.RGQLServerMessage
         * @instance
         */
        RGQLServerMessage.prototype.valueBatch = null;

        /**
         * RGQLServerMessage valueFinalize.
         * @member {rgraphql.IRGQLValueFinalize|null|undefined} valueFinalize
         * @memberof rgraphql.RGQLServerMessage
         * @instance
         */
        RGQLServerMessage.prototype.valueFinalize = null;

        /**
         * Creates a new RGQLServerMessage instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {rgraphql.IRGQLServerMessage=} [properties] Properties to set
         * @returns {rgraphql.RGQLServerMessage} RGQLServerMessage instance
         */
        RGQLServerMessage.create = function create(properties) {
            return new RGQLServerMessage(properties);
        };

        /**
         * Encodes the specified RGQLServerMessage message. Does not implicitly {@link rgraphql.RGQLServerMessage.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {rgraphql.IRGQLServerMessage} message RGQLServerMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLServerMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryError != null && message.hasOwnProperty("queryError"))
                $root.rgraphql.RGQLQueryError.encode(message.queryError, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.valueInit != null && message.hasOwnProperty("valueInit"))
                $root.rgraphql.RGQLValueInit.encode(message.valueInit, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.valueBatch != null && message.hasOwnProperty("valueBatch"))
                $root.rgraphql.RGQLValueBatch.encode(message.valueBatch, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.valueFinalize != null && message.hasOwnProperty("valueFinalize"))
                $root.rgraphql.RGQLValueFinalize.encode(message.valueFinalize, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RGQLServerMessage message, length delimited. Does not implicitly {@link rgraphql.RGQLServerMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {rgraphql.IRGQLServerMessage} message RGQLServerMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLServerMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLServerMessage message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLServerMessage} RGQLServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLServerMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLServerMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 2:
                    message.queryError = $root.rgraphql.RGQLQueryError.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.valueInit = $root.rgraphql.RGQLValueInit.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.valueBatch = $root.rgraphql.RGQLValueBatch.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.valueFinalize = $root.rgraphql.RGQLValueFinalize.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLServerMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLServerMessage} RGQLServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLServerMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLServerMessage message.
         * @function verify
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLServerMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryError != null && message.hasOwnProperty("queryError")) {
                var error = $root.rgraphql.RGQLQueryError.verify(message.queryError);
                if (error)
                    return "queryError." + error;
            }
            if (message.valueInit != null && message.hasOwnProperty("valueInit")) {
                var error = $root.rgraphql.RGQLValueInit.verify(message.valueInit);
                if (error)
                    return "valueInit." + error;
            }
            if (message.valueBatch != null && message.hasOwnProperty("valueBatch")) {
                var error = $root.rgraphql.RGQLValueBatch.verify(message.valueBatch);
                if (error)
                    return "valueBatch." + error;
            }
            if (message.valueFinalize != null && message.hasOwnProperty("valueFinalize")) {
                var error = $root.rgraphql.RGQLValueFinalize.verify(message.valueFinalize);
                if (error)
                    return "valueFinalize." + error;
            }
            return null;
        };

        /**
         * Creates a RGQLServerMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLServerMessage} RGQLServerMessage
         */
        RGQLServerMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLServerMessage)
                return object;
            var message = new $root.rgraphql.RGQLServerMessage();
            if (object.queryError != null) {
                if (typeof object.queryError !== "object")
                    throw TypeError(".rgraphql.RGQLServerMessage.queryError: object expected");
                message.queryError = $root.rgraphql.RGQLQueryError.fromObject(object.queryError);
            }
            if (object.valueInit != null) {
                if (typeof object.valueInit !== "object")
                    throw TypeError(".rgraphql.RGQLServerMessage.valueInit: object expected");
                message.valueInit = $root.rgraphql.RGQLValueInit.fromObject(object.valueInit);
            }
            if (object.valueBatch != null) {
                if (typeof object.valueBatch !== "object")
                    throw TypeError(".rgraphql.RGQLServerMessage.valueBatch: object expected");
                message.valueBatch = $root.rgraphql.RGQLValueBatch.fromObject(object.valueBatch);
            }
            if (object.valueFinalize != null) {
                if (typeof object.valueFinalize !== "object")
                    throw TypeError(".rgraphql.RGQLServerMessage.valueFinalize: object expected");
                message.valueFinalize = $root.rgraphql.RGQLValueFinalize.fromObject(object.valueFinalize);
            }
            return message;
        };

        /**
         * Creates a plain object from a RGQLServerMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLServerMessage
         * @static
         * @param {rgraphql.RGQLServerMessage} message RGQLServerMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLServerMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.queryError = null;
                object.valueInit = null;
                object.valueBatch = null;
                object.valueFinalize = null;
            }
            if (message.queryError != null && message.hasOwnProperty("queryError"))
                object.queryError = $root.rgraphql.RGQLQueryError.toObject(message.queryError, options);
            if (message.valueInit != null && message.hasOwnProperty("valueInit"))
                object.valueInit = $root.rgraphql.RGQLValueInit.toObject(message.valueInit, options);
            if (message.valueBatch != null && message.hasOwnProperty("valueBatch"))
                object.valueBatch = $root.rgraphql.RGQLValueBatch.toObject(message.valueBatch, options);
            if (message.valueFinalize != null && message.hasOwnProperty("valueFinalize"))
                object.valueFinalize = $root.rgraphql.RGQLValueFinalize.toObject(message.valueFinalize, options);
            return object;
        };

        /**
         * Converts this RGQLServerMessage to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLServerMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLServerMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLServerMessage;
    })();

    rgraphql.RGQLValueInit = (function() {

        /**
         * Properties of a RGQLValueInit.
         * @memberof rgraphql
         * @interface IRGQLValueInit
         * @property {number|null} [resultId] RGQLValueInit resultId
         * @property {number|null} [queryId] RGQLValueInit queryId
         * @property {rgraphql.RGQLValueInit.CacheStrategy|null} [cacheStrategy] RGQLValueInit cacheStrategy
         * @property {number|null} [cacheSize] RGQLValueInit cacheSize
         */

        /**
         * Constructs a new RGQLValueInit.
         * @memberof rgraphql
         * @classdesc Represents a RGQLValueInit.
         * @implements IRGQLValueInit
         * @constructor
         * @param {rgraphql.IRGQLValueInit=} [properties] Properties to set
         */
        function RGQLValueInit(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLValueInit resultId.
         * @member {number} resultId
         * @memberof rgraphql.RGQLValueInit
         * @instance
         */
        RGQLValueInit.prototype.resultId = 0;

        /**
         * RGQLValueInit queryId.
         * @member {number} queryId
         * @memberof rgraphql.RGQLValueInit
         * @instance
         */
        RGQLValueInit.prototype.queryId = 0;

        /**
         * RGQLValueInit cacheStrategy.
         * @member {rgraphql.RGQLValueInit.CacheStrategy} cacheStrategy
         * @memberof rgraphql.RGQLValueInit
         * @instance
         */
        RGQLValueInit.prototype.cacheStrategy = 0;

        /**
         * RGQLValueInit cacheSize.
         * @member {number} cacheSize
         * @memberof rgraphql.RGQLValueInit
         * @instance
         */
        RGQLValueInit.prototype.cacheSize = 0;

        /**
         * Creates a new RGQLValueInit instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {rgraphql.IRGQLValueInit=} [properties] Properties to set
         * @returns {rgraphql.RGQLValueInit} RGQLValueInit instance
         */
        RGQLValueInit.create = function create(properties) {
            return new RGQLValueInit(properties);
        };

        /**
         * Encodes the specified RGQLValueInit message. Does not implicitly {@link rgraphql.RGQLValueInit.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {rgraphql.IRGQLValueInit} message RGQLValueInit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValueInit.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resultId);
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.queryId);
            if (message.cacheStrategy != null && message.hasOwnProperty("cacheStrategy"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.cacheStrategy);
            if (message.cacheSize != null && message.hasOwnProperty("cacheSize"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.cacheSize);
            return writer;
        };

        /**
         * Encodes the specified RGQLValueInit message, length delimited. Does not implicitly {@link rgraphql.RGQLValueInit.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {rgraphql.IRGQLValueInit} message RGQLValueInit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValueInit.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLValueInit message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLValueInit} RGQLValueInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValueInit.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLValueInit();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.resultId = reader.uint32();
                    break;
                case 2:
                    message.queryId = reader.uint32();
                    break;
                case 3:
                    message.cacheStrategy = reader.int32();
                    break;
                case 4:
                    message.cacheSize = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLValueInit message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLValueInit} RGQLValueInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValueInit.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLValueInit message.
         * @function verify
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLValueInit.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                if (!$util.isInteger(message.resultId))
                    return "resultId: integer expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId))
                    return "queryId: integer expected";
            if (message.cacheStrategy != null && message.hasOwnProperty("cacheStrategy"))
                switch (message.cacheStrategy) {
                default:
                    return "cacheStrategy: enum value expected";
                case 0:
                    break;
                }
            if (message.cacheSize != null && message.hasOwnProperty("cacheSize"))
                if (!$util.isInteger(message.cacheSize))
                    return "cacheSize: integer expected";
            return null;
        };

        /**
         * Creates a RGQLValueInit message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLValueInit} RGQLValueInit
         */
        RGQLValueInit.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLValueInit)
                return object;
            var message = new $root.rgraphql.RGQLValueInit();
            if (object.resultId != null)
                message.resultId = object.resultId >>> 0;
            if (object.queryId != null)
                message.queryId = object.queryId >>> 0;
            switch (object.cacheStrategy) {
            case "CACHE_LRU":
            case 0:
                message.cacheStrategy = 0;
                break;
            }
            if (object.cacheSize != null)
                message.cacheSize = object.cacheSize >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a RGQLValueInit message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLValueInit
         * @static
         * @param {rgraphql.RGQLValueInit} message RGQLValueInit
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLValueInit.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.resultId = 0;
                object.queryId = 0;
                object.cacheStrategy = options.enums === String ? "CACHE_LRU" : 0;
                object.cacheSize = 0;
            }
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                object.resultId = message.resultId;
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                object.queryId = message.queryId;
            if (message.cacheStrategy != null && message.hasOwnProperty("cacheStrategy"))
                object.cacheStrategy = options.enums === String ? $root.rgraphql.RGQLValueInit.CacheStrategy[message.cacheStrategy] : message.cacheStrategy;
            if (message.cacheSize != null && message.hasOwnProperty("cacheSize"))
                object.cacheSize = message.cacheSize;
            return object;
        };

        /**
         * Converts this RGQLValueInit to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLValueInit
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLValueInit.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * CacheStrategy enum.
         * @name rgraphql.RGQLValueInit.CacheStrategy
         * @enum {string}
         * @property {number} CACHE_LRU=0 CACHE_LRU value
         */
        RGQLValueInit.CacheStrategy = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "CACHE_LRU"] = 0;
            return values;
        })();

        return RGQLValueInit;
    })();

    rgraphql.RGQLValueFinalize = (function() {

        /**
         * Properties of a RGQLValueFinalize.
         * @memberof rgraphql
         * @interface IRGQLValueFinalize
         * @property {number|null} [resultId] RGQLValueFinalize resultId
         */

        /**
         * Constructs a new RGQLValueFinalize.
         * @memberof rgraphql
         * @classdesc Represents a RGQLValueFinalize.
         * @implements IRGQLValueFinalize
         * @constructor
         * @param {rgraphql.IRGQLValueFinalize=} [properties] Properties to set
         */
        function RGQLValueFinalize(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLValueFinalize resultId.
         * @member {number} resultId
         * @memberof rgraphql.RGQLValueFinalize
         * @instance
         */
        RGQLValueFinalize.prototype.resultId = 0;

        /**
         * Creates a new RGQLValueFinalize instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {rgraphql.IRGQLValueFinalize=} [properties] Properties to set
         * @returns {rgraphql.RGQLValueFinalize} RGQLValueFinalize instance
         */
        RGQLValueFinalize.create = function create(properties) {
            return new RGQLValueFinalize(properties);
        };

        /**
         * Encodes the specified RGQLValueFinalize message. Does not implicitly {@link rgraphql.RGQLValueFinalize.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {rgraphql.IRGQLValueFinalize} message RGQLValueFinalize message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValueFinalize.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resultId);
            return writer;
        };

        /**
         * Encodes the specified RGQLValueFinalize message, length delimited. Does not implicitly {@link rgraphql.RGQLValueFinalize.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {rgraphql.IRGQLValueFinalize} message RGQLValueFinalize message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValueFinalize.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLValueFinalize message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLValueFinalize} RGQLValueFinalize
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValueFinalize.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLValueFinalize();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.resultId = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLValueFinalize message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLValueFinalize} RGQLValueFinalize
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValueFinalize.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLValueFinalize message.
         * @function verify
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLValueFinalize.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                if (!$util.isInteger(message.resultId))
                    return "resultId: integer expected";
            return null;
        };

        /**
         * Creates a RGQLValueFinalize message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLValueFinalize} RGQLValueFinalize
         */
        RGQLValueFinalize.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLValueFinalize)
                return object;
            var message = new $root.rgraphql.RGQLValueFinalize();
            if (object.resultId != null)
                message.resultId = object.resultId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a RGQLValueFinalize message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLValueFinalize
         * @static
         * @param {rgraphql.RGQLValueFinalize} message RGQLValueFinalize
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLValueFinalize.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.resultId = 0;
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                object.resultId = message.resultId;
            return object;
        };

        /**
         * Converts this RGQLValueFinalize to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLValueFinalize
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLValueFinalize.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLValueFinalize;
    })();

    rgraphql.RGQLQueryError = (function() {

        /**
         * Properties of a RGQLQueryError.
         * @memberof rgraphql
         * @interface IRGQLQueryError
         * @property {number|null} [queryId] RGQLQueryError queryId
         * @property {number|null} [queryNodeId] RGQLQueryError queryNodeId
         * @property {string|null} [error] RGQLQueryError error
         */

        /**
         * Constructs a new RGQLQueryError.
         * @memberof rgraphql
         * @classdesc Represents a RGQLQueryError.
         * @implements IRGQLQueryError
         * @constructor
         * @param {rgraphql.IRGQLQueryError=} [properties] Properties to set
         */
        function RGQLQueryError(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLQueryError queryId.
         * @member {number} queryId
         * @memberof rgraphql.RGQLQueryError
         * @instance
         */
        RGQLQueryError.prototype.queryId = 0;

        /**
         * RGQLQueryError queryNodeId.
         * @member {number} queryNodeId
         * @memberof rgraphql.RGQLQueryError
         * @instance
         */
        RGQLQueryError.prototype.queryNodeId = 0;

        /**
         * RGQLQueryError error.
         * @member {string} error
         * @memberof rgraphql.RGQLQueryError
         * @instance
         */
        RGQLQueryError.prototype.error = "";

        /**
         * Creates a new RGQLQueryError instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {rgraphql.IRGQLQueryError=} [properties] Properties to set
         * @returns {rgraphql.RGQLQueryError} RGQLQueryError instance
         */
        RGQLQueryError.create = function create(properties) {
            return new RGQLQueryError(properties);
        };

        /**
         * Encodes the specified RGQLQueryError message. Does not implicitly {@link rgraphql.RGQLQueryError.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {rgraphql.IRGQLQueryError} message RGQLQueryError message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryError.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.queryId);
            if (message.queryNodeId != null && message.hasOwnProperty("queryNodeId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.queryNodeId);
            if (message.error != null && message.hasOwnProperty("error"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
            return writer;
        };

        /**
         * Encodes the specified RGQLQueryError message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryError.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {rgraphql.IRGQLQueryError} message RGQLQueryError message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLQueryError.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLQueryError message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLQueryError} RGQLQueryError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryError.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLQueryError();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.queryId = reader.uint32();
                    break;
                case 2:
                    message.queryNodeId = reader.uint32();
                    break;
                case 3:
                    message.error = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLQueryError message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLQueryError} RGQLQueryError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLQueryError.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLQueryError message.
         * @function verify
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLQueryError.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId))
                    return "queryId: integer expected";
            if (message.queryNodeId != null && message.hasOwnProperty("queryNodeId"))
                if (!$util.isInteger(message.queryNodeId))
                    return "queryNodeId: integer expected";
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            return null;
        };

        /**
         * Creates a RGQLQueryError message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLQueryError} RGQLQueryError
         */
        RGQLQueryError.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLQueryError)
                return object;
            var message = new $root.rgraphql.RGQLQueryError();
            if (object.queryId != null)
                message.queryId = object.queryId >>> 0;
            if (object.queryNodeId != null)
                message.queryNodeId = object.queryNodeId >>> 0;
            if (object.error != null)
                message.error = String(object.error);
            return message;
        };

        /**
         * Creates a plain object from a RGQLQueryError message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLQueryError
         * @static
         * @param {rgraphql.RGQLQueryError} message RGQLQueryError
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLQueryError.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.queryId = 0;
                object.queryNodeId = 0;
                object.error = "";
            }
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                object.queryId = message.queryId;
            if (message.queryNodeId != null && message.hasOwnProperty("queryNodeId"))
                object.queryNodeId = message.queryNodeId;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            return object;
        };

        /**
         * Converts this RGQLQueryError to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLQueryError
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLQueryError.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLQueryError;
    })();

    rgraphql.RGQLValue = (function() {

        /**
         * Properties of a RGQLValue.
         * @memberof rgraphql
         * @interface IRGQLValue
         * @property {number|null} [queryNodeId] RGQLValue queryNodeId
         * @property {number|null} [arrayIndex] RGQLValue arrayIndex
         * @property {number|null} [posIdentifier] RGQLValue posIdentifier
         * @property {rgraphql.IRGQLPrimitive|null} [value] RGQLValue value
         * @property {string|null} [error] RGQLValue error
         */

        /**
         * Constructs a new RGQLValue.
         * @memberof rgraphql
         * @classdesc Represents a RGQLValue.
         * @implements IRGQLValue
         * @constructor
         * @param {rgraphql.IRGQLValue=} [properties] Properties to set
         */
        function RGQLValue(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLValue queryNodeId.
         * @member {number} queryNodeId
         * @memberof rgraphql.RGQLValue
         * @instance
         */
        RGQLValue.prototype.queryNodeId = 0;

        /**
         * RGQLValue arrayIndex.
         * @member {number} arrayIndex
         * @memberof rgraphql.RGQLValue
         * @instance
         */
        RGQLValue.prototype.arrayIndex = 0;

        /**
         * RGQLValue posIdentifier.
         * @member {number} posIdentifier
         * @memberof rgraphql.RGQLValue
         * @instance
         */
        RGQLValue.prototype.posIdentifier = 0;

        /**
         * RGQLValue value.
         * @member {rgraphql.IRGQLPrimitive|null|undefined} value
         * @memberof rgraphql.RGQLValue
         * @instance
         */
        RGQLValue.prototype.value = null;

        /**
         * RGQLValue error.
         * @member {string} error
         * @memberof rgraphql.RGQLValue
         * @instance
         */
        RGQLValue.prototype.error = "";

        /**
         * Creates a new RGQLValue instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {rgraphql.IRGQLValue=} [properties] Properties to set
         * @returns {rgraphql.RGQLValue} RGQLValue instance
         */
        RGQLValue.create = function create(properties) {
            return new RGQLValue(properties);
        };

        /**
         * Encodes the specified RGQLValue message. Does not implicitly {@link rgraphql.RGQLValue.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {rgraphql.IRGQLValue} message RGQLValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValue.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryNodeId != null && message.hasOwnProperty("queryNodeId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.queryNodeId);
            if (message.arrayIndex != null && message.hasOwnProperty("arrayIndex"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.arrayIndex);
            if (message.posIdentifier != null && message.hasOwnProperty("posIdentifier"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.posIdentifier);
            if (message.value != null && message.hasOwnProperty("value"))
                $root.rgraphql.RGQLPrimitive.encode(message.value, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.error != null && message.hasOwnProperty("error"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.error);
            return writer;
        };

        /**
         * Encodes the specified RGQLValue message, length delimited. Does not implicitly {@link rgraphql.RGQLValue.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {rgraphql.IRGQLValue} message RGQLValue message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValue.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLValue message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLValue} RGQLValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValue.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLValue();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.queryNodeId = reader.uint32();
                    break;
                case 2:
                    message.arrayIndex = reader.uint32();
                    break;
                case 3:
                    message.posIdentifier = reader.uint32();
                    break;
                case 4:
                    message.value = $root.rgraphql.RGQLPrimitive.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.error = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLValue message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLValue} RGQLValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValue.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLValue message.
         * @function verify
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLValue.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryNodeId != null && message.hasOwnProperty("queryNodeId"))
                if (!$util.isInteger(message.queryNodeId))
                    return "queryNodeId: integer expected";
            if (message.arrayIndex != null && message.hasOwnProperty("arrayIndex"))
                if (!$util.isInteger(message.arrayIndex))
                    return "arrayIndex: integer expected";
            if (message.posIdentifier != null && message.hasOwnProperty("posIdentifier"))
                if (!$util.isInteger(message.posIdentifier))
                    return "posIdentifier: integer expected";
            if (message.value != null && message.hasOwnProperty("value")) {
                var error = $root.rgraphql.RGQLPrimitive.verify(message.value);
                if (error)
                    return "value." + error;
            }
            if (message.error != null && message.hasOwnProperty("error"))
                if (!$util.isString(message.error))
                    return "error: string expected";
            return null;
        };

        /**
         * Creates a RGQLValue message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLValue} RGQLValue
         */
        RGQLValue.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLValue)
                return object;
            var message = new $root.rgraphql.RGQLValue();
            if (object.queryNodeId != null)
                message.queryNodeId = object.queryNodeId >>> 0;
            if (object.arrayIndex != null)
                message.arrayIndex = object.arrayIndex >>> 0;
            if (object.posIdentifier != null)
                message.posIdentifier = object.posIdentifier >>> 0;
            if (object.value != null) {
                if (typeof object.value !== "object")
                    throw TypeError(".rgraphql.RGQLValue.value: object expected");
                message.value = $root.rgraphql.RGQLPrimitive.fromObject(object.value);
            }
            if (object.error != null)
                message.error = String(object.error);
            return message;
        };

        /**
         * Creates a plain object from a RGQLValue message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLValue
         * @static
         * @param {rgraphql.RGQLValue} message RGQLValue
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLValue.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.queryNodeId = 0;
                object.arrayIndex = 0;
                object.posIdentifier = 0;
                object.value = null;
                object.error = "";
            }
            if (message.queryNodeId != null && message.hasOwnProperty("queryNodeId"))
                object.queryNodeId = message.queryNodeId;
            if (message.arrayIndex != null && message.hasOwnProperty("arrayIndex"))
                object.arrayIndex = message.arrayIndex;
            if (message.posIdentifier != null && message.hasOwnProperty("posIdentifier"))
                object.posIdentifier = message.posIdentifier;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = $root.rgraphql.RGQLPrimitive.toObject(message.value, options);
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = message.error;
            return object;
        };

        /**
         * Converts this RGQLValue to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLValue
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLValue.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLValue;
    })();

    rgraphql.RGQLValueBatch = (function() {

        /**
         * Properties of a RGQLValueBatch.
         * @memberof rgraphql
         * @interface IRGQLValueBatch
         * @property {number|null} [resultId] RGQLValueBatch resultId
         * @property {Array.<Uint8Array>|null} [values] RGQLValueBatch values
         */

        /**
         * Constructs a new RGQLValueBatch.
         * @memberof rgraphql
         * @classdesc Represents a RGQLValueBatch.
         * @implements IRGQLValueBatch
         * @constructor
         * @param {rgraphql.IRGQLValueBatch=} [properties] Properties to set
         */
        function RGQLValueBatch(properties) {
            this.values = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGQLValueBatch resultId.
         * @member {number} resultId
         * @memberof rgraphql.RGQLValueBatch
         * @instance
         */
        RGQLValueBatch.prototype.resultId = 0;

        /**
         * RGQLValueBatch values.
         * @member {Array.<Uint8Array>} values
         * @memberof rgraphql.RGQLValueBatch
         * @instance
         */
        RGQLValueBatch.prototype.values = $util.emptyArray;

        /**
         * Creates a new RGQLValueBatch instance using the specified properties.
         * @function create
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {rgraphql.IRGQLValueBatch=} [properties] Properties to set
         * @returns {rgraphql.RGQLValueBatch} RGQLValueBatch instance
         */
        RGQLValueBatch.create = function create(properties) {
            return new RGQLValueBatch(properties);
        };

        /**
         * Encodes the specified RGQLValueBatch message. Does not implicitly {@link rgraphql.RGQLValueBatch.verify|verify} messages.
         * @function encode
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {rgraphql.IRGQLValueBatch} message RGQLValueBatch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValueBatch.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.resultId);
            if (message.values != null && message.values.length)
                for (var i = 0; i < message.values.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.values[i]);
            return writer;
        };

        /**
         * Encodes the specified RGQLValueBatch message, length delimited. Does not implicitly {@link rgraphql.RGQLValueBatch.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {rgraphql.IRGQLValueBatch} message RGQLValueBatch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGQLValueBatch.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGQLValueBatch message from the specified reader or buffer.
         * @function decode
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rgraphql.RGQLValueBatch} RGQLValueBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValueBatch.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.rgraphql.RGQLValueBatch();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.resultId = reader.uint32();
                    break;
                case 2:
                    if (!(message.values && message.values.length))
                        message.values = [];
                    message.values.push(reader.bytes());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RGQLValueBatch message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rgraphql.RGQLValueBatch} RGQLValueBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGQLValueBatch.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGQLValueBatch message.
         * @function verify
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGQLValueBatch.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                if (!$util.isInteger(message.resultId))
                    return "resultId: integer expected";
            if (message.values != null && message.hasOwnProperty("values")) {
                if (!Array.isArray(message.values))
                    return "values: array expected";
                for (var i = 0; i < message.values.length; ++i)
                    if (!(message.values[i] && typeof message.values[i].length === "number" || $util.isString(message.values[i])))
                        return "values: buffer[] expected";
            }
            return null;
        };

        /**
         * Creates a RGQLValueBatch message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rgraphql.RGQLValueBatch} RGQLValueBatch
         */
        RGQLValueBatch.fromObject = function fromObject(object) {
            if (object instanceof $root.rgraphql.RGQLValueBatch)
                return object;
            var message = new $root.rgraphql.RGQLValueBatch();
            if (object.resultId != null)
                message.resultId = object.resultId >>> 0;
            if (object.values) {
                if (!Array.isArray(object.values))
                    throw TypeError(".rgraphql.RGQLValueBatch.values: array expected");
                message.values = [];
                for (var i = 0; i < object.values.length; ++i)
                    if (typeof object.values[i] === "string")
                        $util.base64.decode(object.values[i], message.values[i] = $util.newBuffer($util.base64.length(object.values[i])), 0);
                    else if (object.values[i].length)
                        message.values[i] = object.values[i];
            }
            return message;
        };

        /**
         * Creates a plain object from a RGQLValueBatch message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rgraphql.RGQLValueBatch
         * @static
         * @param {rgraphql.RGQLValueBatch} message RGQLValueBatch
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGQLValueBatch.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.values = [];
            if (options.defaults)
                object.resultId = 0;
            if (message.resultId != null && message.hasOwnProperty("resultId"))
                object.resultId = message.resultId;
            if (message.values && message.values.length) {
                object.values = [];
                for (var j = 0; j < message.values.length; ++j)
                    object.values[j] = options.bytes === String ? $util.base64.encode(message.values[j], 0, message.values[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.values[j]) : message.values[j];
            }
            return object;
        };

        /**
         * Converts this RGQLValueBatch to JSON.
         * @function toJSON
         * @memberof rgraphql.RGQLValueBatch
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGQLValueBatch.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return RGQLValueBatch;
    })();

    return rgraphql;
})();

module.exports = $root;
