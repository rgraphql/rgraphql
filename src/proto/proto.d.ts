import * as $protobuf from "protobufjs";
/** Namespace rgraphql. */
export namespace rgraphql {

    /** Properties of a RGQLQueryFieldDirective. */
    interface IRGQLQueryFieldDirective {

        /** RGQLQueryFieldDirective name */
        name?: (string|null);

        /** RGQLQueryFieldDirective args */
        args?: (rgraphql.IFieldArgument[]|null);
    }

    /** Represents a RGQLQueryFieldDirective. */
    class RGQLQueryFieldDirective implements IRGQLQueryFieldDirective {

        /**
         * Constructs a new RGQLQueryFieldDirective.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLQueryFieldDirective);

        /** RGQLQueryFieldDirective name. */
        public name: string;

        /** RGQLQueryFieldDirective args. */
        public args: rgraphql.IFieldArgument[];

        /**
         * Creates a new RGQLQueryFieldDirective instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLQueryFieldDirective instance
         */
        public static create(properties?: rgraphql.IRGQLQueryFieldDirective): rgraphql.RGQLQueryFieldDirective;

        /**
         * Encodes the specified RGQLQueryFieldDirective message. Does not implicitly {@link rgraphql.RGQLQueryFieldDirective.verify|verify} messages.
         * @param message RGQLQueryFieldDirective message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLQueryFieldDirective, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLQueryFieldDirective message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryFieldDirective.verify|verify} messages.
         * @param message RGQLQueryFieldDirective message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLQueryFieldDirective, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLQueryFieldDirective message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLQueryFieldDirective
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryFieldDirective;

        /**
         * Decodes a RGQLQueryFieldDirective message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLQueryFieldDirective
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryFieldDirective;

        /**
         * Verifies a RGQLQueryFieldDirective message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLQueryFieldDirective message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLQueryFieldDirective
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryFieldDirective;

        /**
         * Creates a plain object from a RGQLQueryFieldDirective message. Also converts values to other types if specified.
         * @param message RGQLQueryFieldDirective
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLQueryFieldDirective, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLQueryFieldDirective to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLQueryTreeNode. */
    interface IRGQLQueryTreeNode {

        /** RGQLQueryTreeNode id */
        id?: (number|null);

        /** RGQLQueryTreeNode fieldName */
        fieldName?: (string|null);

        /** RGQLQueryTreeNode args */
        args?: (rgraphql.IFieldArgument[]|null);

        /** RGQLQueryTreeNode directive */
        directive?: (rgraphql.IRGQLQueryFieldDirective[]|null);

        /** RGQLQueryTreeNode children */
        children?: (rgraphql.IRGQLQueryTreeNode[]|null);
    }

    /** Represents a RGQLQueryTreeNode. */
    class RGQLQueryTreeNode implements IRGQLQueryTreeNode {

        /**
         * Constructs a new RGQLQueryTreeNode.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLQueryTreeNode);

        /** RGQLQueryTreeNode id. */
        public id: number;

        /** RGQLQueryTreeNode fieldName. */
        public fieldName: string;

        /** RGQLQueryTreeNode args. */
        public args: rgraphql.IFieldArgument[];

        /** RGQLQueryTreeNode directive. */
        public directive: rgraphql.IRGQLQueryFieldDirective[];

        /** RGQLQueryTreeNode children. */
        public children: rgraphql.IRGQLQueryTreeNode[];

        /**
         * Creates a new RGQLQueryTreeNode instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLQueryTreeNode instance
         */
        public static create(properties?: rgraphql.IRGQLQueryTreeNode): rgraphql.RGQLQueryTreeNode;

        /**
         * Encodes the specified RGQLQueryTreeNode message. Does not implicitly {@link rgraphql.RGQLQueryTreeNode.verify|verify} messages.
         * @param message RGQLQueryTreeNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLQueryTreeNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLQueryTreeNode message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryTreeNode.verify|verify} messages.
         * @param message RGQLQueryTreeNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLQueryTreeNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLQueryTreeNode message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLQueryTreeNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryTreeNode;

        /**
         * Decodes a RGQLQueryTreeNode message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLQueryTreeNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryTreeNode;

        /**
         * Verifies a RGQLQueryTreeNode message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLQueryTreeNode message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLQueryTreeNode
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryTreeNode;

        /**
         * Creates a plain object from a RGQLQueryTreeNode message. Also converts values to other types if specified.
         * @param message RGQLQueryTreeNode
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLQueryTreeNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLQueryTreeNode to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a FieldArgument. */
    interface IFieldArgument {

        /** FieldArgument name */
        name?: (string|null);

        /** FieldArgument variableId */
        variableId?: (number|null);
    }

    /** Represents a FieldArgument. */
    class FieldArgument implements IFieldArgument {

        /**
         * Constructs a new FieldArgument.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IFieldArgument);

        /** FieldArgument name. */
        public name: string;

        /** FieldArgument variableId. */
        public variableId: number;

        /**
         * Creates a new FieldArgument instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FieldArgument instance
         */
        public static create(properties?: rgraphql.IFieldArgument): rgraphql.FieldArgument;

        /**
         * Encodes the specified FieldArgument message. Does not implicitly {@link rgraphql.FieldArgument.verify|verify} messages.
         * @param message FieldArgument message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IFieldArgument, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FieldArgument message, length delimited. Does not implicitly {@link rgraphql.FieldArgument.verify|verify} messages.
         * @param message FieldArgument message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IFieldArgument, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FieldArgument message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FieldArgument
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.FieldArgument;

        /**
         * Decodes a FieldArgument message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FieldArgument
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.FieldArgument;

        /**
         * Verifies a FieldArgument message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FieldArgument message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FieldArgument
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.FieldArgument;

        /**
         * Creates a plain object from a FieldArgument message. Also converts values to other types if specified.
         * @param message FieldArgument
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.FieldArgument, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FieldArgument to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ASTVariable. */
    interface IASTVariable {

        /** ASTVariable id */
        id?: (number|null);

        /** ASTVariable value */
        value?: (rgraphql.IRGQLPrimitive|null);
    }

    /** Represents a ASTVariable. */
    class ASTVariable implements IASTVariable {

        /**
         * Constructs a new ASTVariable.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IASTVariable);

        /** ASTVariable id. */
        public id: number;

        /** ASTVariable value. */
        public value?: (rgraphql.IRGQLPrimitive|null);

        /**
         * Creates a new ASTVariable instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ASTVariable instance
         */
        public static create(properties?: rgraphql.IASTVariable): rgraphql.ASTVariable;

        /**
         * Encodes the specified ASTVariable message. Does not implicitly {@link rgraphql.ASTVariable.verify|verify} messages.
         * @param message ASTVariable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IASTVariable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ASTVariable message, length delimited. Does not implicitly {@link rgraphql.ASTVariable.verify|verify} messages.
         * @param message ASTVariable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IASTVariable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ASTVariable message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ASTVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.ASTVariable;

        /**
         * Decodes a ASTVariable message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ASTVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.ASTVariable;

        /**
         * Verifies a ASTVariable message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ASTVariable message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ASTVariable
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.ASTVariable;

        /**
         * Creates a plain object from a ASTVariable message. Also converts values to other types if specified.
         * @param message ASTVariable
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.ASTVariable, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ASTVariable to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLPrimitive. */
    interface IRGQLPrimitive {

        /** RGQLPrimitive kind */
        kind?: (rgraphql.RGQLPrimitive.Kind|null);

        /** RGQLPrimitive intValue */
        intValue?: (number|null);

        /** RGQLPrimitive floatValue */
        floatValue?: (number|null);

        /** RGQLPrimitive stringValue */
        stringValue?: (string|null);

        /** RGQLPrimitive boolValue */
        boolValue?: (boolean|null);
    }

    /** Represents a RGQLPrimitive. */
    class RGQLPrimitive implements IRGQLPrimitive {

        /**
         * Constructs a new RGQLPrimitive.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLPrimitive);

        /** RGQLPrimitive kind. */
        public kind: rgraphql.RGQLPrimitive.Kind;

        /** RGQLPrimitive intValue. */
        public intValue: number;

        /** RGQLPrimitive floatValue. */
        public floatValue: number;

        /** RGQLPrimitive stringValue. */
        public stringValue: string;

        /** RGQLPrimitive boolValue. */
        public boolValue: boolean;

        /**
         * Creates a new RGQLPrimitive instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLPrimitive instance
         */
        public static create(properties?: rgraphql.IRGQLPrimitive): rgraphql.RGQLPrimitive;

        /**
         * Encodes the specified RGQLPrimitive message. Does not implicitly {@link rgraphql.RGQLPrimitive.verify|verify} messages.
         * @param message RGQLPrimitive message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLPrimitive, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLPrimitive message, length delimited. Does not implicitly {@link rgraphql.RGQLPrimitive.verify|verify} messages.
         * @param message RGQLPrimitive message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLPrimitive, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLPrimitive message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLPrimitive
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLPrimitive;

        /**
         * Decodes a RGQLPrimitive message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLPrimitive
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLPrimitive;

        /**
         * Verifies a RGQLPrimitive message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLPrimitive message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLPrimitive
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLPrimitive;

        /**
         * Creates a plain object from a RGQLPrimitive message. Also converts values to other types if specified.
         * @param message RGQLPrimitive
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLPrimitive, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLPrimitive to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace RGQLPrimitive {

        /** Kind enum. */
        enum Kind {
            PRIMITIVE_KIND_NULL = 0,
            PRIMITIVE_KIND_INT = 1,
            PRIMITIVE_KIND_FLOAT = 2,
            PRIMITIVE_KIND_STRING = 3,
            PRIMITIVE_KIND_BOOL = 4,
            PRIMITIVE_KIND_OBJECT = 5,
            PRIMITIVE_KIND_ARRAY = 6
        }
    }

    /** Properties of a RGQLClientMessage. */
    interface IRGQLClientMessage {

        /** RGQLClientMessage initQuery */
        initQuery?: (rgraphql.IRGQLQueryInit|null);

        /** RGQLClientMessage mutateTree */
        mutateTree?: (rgraphql.IRGQLQueryTreeMutation|null);

        /** RGQLClientMessage finishQuery */
        finishQuery?: (rgraphql.IRGQLQueryFinish|null);
    }

    /** Represents a RGQLClientMessage. */
    class RGQLClientMessage implements IRGQLClientMessage {

        /**
         * Constructs a new RGQLClientMessage.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLClientMessage);

        /** RGQLClientMessage initQuery. */
        public initQuery?: (rgraphql.IRGQLQueryInit|null);

        /** RGQLClientMessage mutateTree. */
        public mutateTree?: (rgraphql.IRGQLQueryTreeMutation|null);

        /** RGQLClientMessage finishQuery. */
        public finishQuery?: (rgraphql.IRGQLQueryFinish|null);

        /**
         * Creates a new RGQLClientMessage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLClientMessage instance
         */
        public static create(properties?: rgraphql.IRGQLClientMessage): rgraphql.RGQLClientMessage;

        /**
         * Encodes the specified RGQLClientMessage message. Does not implicitly {@link rgraphql.RGQLClientMessage.verify|verify} messages.
         * @param message RGQLClientMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLClientMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLClientMessage message, length delimited. Does not implicitly {@link rgraphql.RGQLClientMessage.verify|verify} messages.
         * @param message RGQLClientMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLClientMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLClientMessage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLClientMessage;

        /**
         * Decodes a RGQLClientMessage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLClientMessage;

        /**
         * Verifies a RGQLClientMessage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLClientMessage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLClientMessage
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLClientMessage;

        /**
         * Creates a plain object from a RGQLClientMessage message. Also converts values to other types if specified.
         * @param message RGQLClientMessage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLClientMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLClientMessage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLQueryInit. */
    interface IRGQLQueryInit {

        /** RGQLQueryInit queryId */
        queryId?: (number|null);

        /** RGQLQueryInit forceSerial */
        forceSerial?: (boolean|null);

        /** RGQLQueryInit operationType */
        operationType?: (string|null);
    }

    /** Represents a RGQLQueryInit. */
    class RGQLQueryInit implements IRGQLQueryInit {

        /**
         * Constructs a new RGQLQueryInit.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLQueryInit);

        /** RGQLQueryInit queryId. */
        public queryId: number;

        /** RGQLQueryInit forceSerial. */
        public forceSerial: boolean;

        /** RGQLQueryInit operationType. */
        public operationType: string;

        /**
         * Creates a new RGQLQueryInit instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLQueryInit instance
         */
        public static create(properties?: rgraphql.IRGQLQueryInit): rgraphql.RGQLQueryInit;

        /**
         * Encodes the specified RGQLQueryInit message. Does not implicitly {@link rgraphql.RGQLQueryInit.verify|verify} messages.
         * @param message RGQLQueryInit message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLQueryInit, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLQueryInit message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryInit.verify|verify} messages.
         * @param message RGQLQueryInit message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLQueryInit, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLQueryInit message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLQueryInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryInit;

        /**
         * Decodes a RGQLQueryInit message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLQueryInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryInit;

        /**
         * Verifies a RGQLQueryInit message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLQueryInit message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLQueryInit
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryInit;

        /**
         * Creates a plain object from a RGQLQueryInit message. Also converts values to other types if specified.
         * @param message RGQLQueryInit
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLQueryInit, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLQueryInit to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLQueryTreeMutation. */
    interface IRGQLQueryTreeMutation {

        /** RGQLQueryTreeMutation queryId */
        queryId?: (number|null);

        /** RGQLQueryTreeMutation nodeMutation */
        nodeMutation?: (rgraphql.RGQLQueryTreeMutation.INodeMutation[]|null);

        /** RGQLQueryTreeMutation variables */
        variables?: (rgraphql.IASTVariable[]|null);
    }

    /** Represents a RGQLQueryTreeMutation. */
    class RGQLQueryTreeMutation implements IRGQLQueryTreeMutation {

        /**
         * Constructs a new RGQLQueryTreeMutation.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLQueryTreeMutation);

        /** RGQLQueryTreeMutation queryId. */
        public queryId: number;

        /** RGQLQueryTreeMutation nodeMutation. */
        public nodeMutation: rgraphql.RGQLQueryTreeMutation.INodeMutation[];

        /** RGQLQueryTreeMutation variables. */
        public variables: rgraphql.IASTVariable[];

        /**
         * Creates a new RGQLQueryTreeMutation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLQueryTreeMutation instance
         */
        public static create(properties?: rgraphql.IRGQLQueryTreeMutation): rgraphql.RGQLQueryTreeMutation;

        /**
         * Encodes the specified RGQLQueryTreeMutation message. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.verify|verify} messages.
         * @param message RGQLQueryTreeMutation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLQueryTreeMutation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLQueryTreeMutation message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.verify|verify} messages.
         * @param message RGQLQueryTreeMutation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLQueryTreeMutation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLQueryTreeMutation message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLQueryTreeMutation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryTreeMutation;

        /**
         * Decodes a RGQLQueryTreeMutation message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLQueryTreeMutation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryTreeMutation;

        /**
         * Verifies a RGQLQueryTreeMutation message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLQueryTreeMutation message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLQueryTreeMutation
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryTreeMutation;

        /**
         * Creates a plain object from a RGQLQueryTreeMutation message. Also converts values to other types if specified.
         * @param message RGQLQueryTreeMutation
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLQueryTreeMutation, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLQueryTreeMutation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace RGQLQueryTreeMutation {

        /** Properties of a NodeMutation. */
        interface INodeMutation {

            /** NodeMutation nodeId */
            nodeId?: (number|null);

            /** NodeMutation operation */
            operation?: (rgraphql.RGQLQueryTreeMutation.SubtreeOperation|null);

            /** NodeMutation node */
            node?: (rgraphql.IRGQLQueryTreeNode|null);
        }

        /** Represents a NodeMutation. */
        class NodeMutation implements INodeMutation {

            /**
             * Constructs a new NodeMutation.
             * @param [properties] Properties to set
             */
            constructor(properties?: rgraphql.RGQLQueryTreeMutation.INodeMutation);

            /** NodeMutation nodeId. */
            public nodeId: number;

            /** NodeMutation operation. */
            public operation: rgraphql.RGQLQueryTreeMutation.SubtreeOperation;

            /** NodeMutation node. */
            public node?: (rgraphql.IRGQLQueryTreeNode|null);

            /**
             * Creates a new NodeMutation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NodeMutation instance
             */
            public static create(properties?: rgraphql.RGQLQueryTreeMutation.INodeMutation): rgraphql.RGQLQueryTreeMutation.NodeMutation;

            /**
             * Encodes the specified NodeMutation message. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.NodeMutation.verify|verify} messages.
             * @param message NodeMutation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: rgraphql.RGQLQueryTreeMutation.INodeMutation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NodeMutation message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryTreeMutation.NodeMutation.verify|verify} messages.
             * @param message NodeMutation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: rgraphql.RGQLQueryTreeMutation.INodeMutation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NodeMutation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NodeMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryTreeMutation.NodeMutation;

            /**
             * Decodes a NodeMutation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NodeMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryTreeMutation.NodeMutation;

            /**
             * Verifies a NodeMutation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NodeMutation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NodeMutation
             */
            public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryTreeMutation.NodeMutation;

            /**
             * Creates a plain object from a NodeMutation message. Also converts values to other types if specified.
             * @param message NodeMutation
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: rgraphql.RGQLQueryTreeMutation.NodeMutation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NodeMutation to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** SubtreeOperation enum. */
        enum SubtreeOperation {
            SUBTREE_ADD_CHILD = 0,
            SUBTREE_DELETE = 1
        }
    }

    /** Properties of a RGQLQueryFinish. */
    interface IRGQLQueryFinish {

        /** RGQLQueryFinish queryId */
        queryId?: (number|null);
    }

    /** Represents a RGQLQueryFinish. */
    class RGQLQueryFinish implements IRGQLQueryFinish {

        /**
         * Constructs a new RGQLQueryFinish.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLQueryFinish);

        /** RGQLQueryFinish queryId. */
        public queryId: number;

        /**
         * Creates a new RGQLQueryFinish instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLQueryFinish instance
         */
        public static create(properties?: rgraphql.IRGQLQueryFinish): rgraphql.RGQLQueryFinish;

        /**
         * Encodes the specified RGQLQueryFinish message. Does not implicitly {@link rgraphql.RGQLQueryFinish.verify|verify} messages.
         * @param message RGQLQueryFinish message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLQueryFinish, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLQueryFinish message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryFinish.verify|verify} messages.
         * @param message RGQLQueryFinish message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLQueryFinish, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLQueryFinish message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLQueryFinish
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryFinish;

        /**
         * Decodes a RGQLQueryFinish message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLQueryFinish
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryFinish;

        /**
         * Verifies a RGQLQueryFinish message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLQueryFinish message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLQueryFinish
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryFinish;

        /**
         * Creates a plain object from a RGQLQueryFinish message. Also converts values to other types if specified.
         * @param message RGQLQueryFinish
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLQueryFinish, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLQueryFinish to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLServerMessage. */
    interface IRGQLServerMessage {

        /** RGQLServerMessage queryError */
        queryError?: (rgraphql.IRGQLQueryError|null);

        /** RGQLServerMessage valueInit */
        valueInit?: (rgraphql.IRGQLValueInit|null);

        /** RGQLServerMessage valueBatch */
        valueBatch?: (rgraphql.IRGQLValueBatch|null);

        /** RGQLServerMessage valueFinalize */
        valueFinalize?: (rgraphql.IRGQLValueFinalize|null);
    }

    /** Represents a RGQLServerMessage. */
    class RGQLServerMessage implements IRGQLServerMessage {

        /**
         * Constructs a new RGQLServerMessage.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLServerMessage);

        /** RGQLServerMessage queryError. */
        public queryError?: (rgraphql.IRGQLQueryError|null);

        /** RGQLServerMessage valueInit. */
        public valueInit?: (rgraphql.IRGQLValueInit|null);

        /** RGQLServerMessage valueBatch. */
        public valueBatch?: (rgraphql.IRGQLValueBatch|null);

        /** RGQLServerMessage valueFinalize. */
        public valueFinalize?: (rgraphql.IRGQLValueFinalize|null);

        /**
         * Creates a new RGQLServerMessage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLServerMessage instance
         */
        public static create(properties?: rgraphql.IRGQLServerMessage): rgraphql.RGQLServerMessage;

        /**
         * Encodes the specified RGQLServerMessage message. Does not implicitly {@link rgraphql.RGQLServerMessage.verify|verify} messages.
         * @param message RGQLServerMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLServerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLServerMessage message, length delimited. Does not implicitly {@link rgraphql.RGQLServerMessage.verify|verify} messages.
         * @param message RGQLServerMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLServerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLServerMessage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLServerMessage;

        /**
         * Decodes a RGQLServerMessage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLServerMessage;

        /**
         * Verifies a RGQLServerMessage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLServerMessage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLServerMessage
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLServerMessage;

        /**
         * Creates a plain object from a RGQLServerMessage message. Also converts values to other types if specified.
         * @param message RGQLServerMessage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLServerMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLServerMessage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLValueInit. */
    interface IRGQLValueInit {

        /** RGQLValueInit resultId */
        resultId?: (number|null);

        /** RGQLValueInit queryId */
        queryId?: (number|null);

        /** RGQLValueInit cacheStrategy */
        cacheStrategy?: (rgraphql.RGQLValueInit.CacheStrategy|null);

        /** RGQLValueInit cacheSize */
        cacheSize?: (number|null);
    }

    /** Represents a RGQLValueInit. */
    class RGQLValueInit implements IRGQLValueInit {

        /**
         * Constructs a new RGQLValueInit.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLValueInit);

        /** RGQLValueInit resultId. */
        public resultId: number;

        /** RGQLValueInit queryId. */
        public queryId: number;

        /** RGQLValueInit cacheStrategy. */
        public cacheStrategy: rgraphql.RGQLValueInit.CacheStrategy;

        /** RGQLValueInit cacheSize. */
        public cacheSize: number;

        /**
         * Creates a new RGQLValueInit instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLValueInit instance
         */
        public static create(properties?: rgraphql.IRGQLValueInit): rgraphql.RGQLValueInit;

        /**
         * Encodes the specified RGQLValueInit message. Does not implicitly {@link rgraphql.RGQLValueInit.verify|verify} messages.
         * @param message RGQLValueInit message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLValueInit, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLValueInit message, length delimited. Does not implicitly {@link rgraphql.RGQLValueInit.verify|verify} messages.
         * @param message RGQLValueInit message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLValueInit, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLValueInit message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLValueInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLValueInit;

        /**
         * Decodes a RGQLValueInit message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLValueInit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLValueInit;

        /**
         * Verifies a RGQLValueInit message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLValueInit message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLValueInit
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLValueInit;

        /**
         * Creates a plain object from a RGQLValueInit message. Also converts values to other types if specified.
         * @param message RGQLValueInit
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLValueInit, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLValueInit to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace RGQLValueInit {

        /** CacheStrategy enum. */
        enum CacheStrategy {
            CACHE_LRU = 0
        }
    }

    /** Properties of a RGQLValueFinalize. */
    interface IRGQLValueFinalize {

        /** RGQLValueFinalize resultId */
        resultId?: (number|null);
    }

    /** Represents a RGQLValueFinalize. */
    class RGQLValueFinalize implements IRGQLValueFinalize {

        /**
         * Constructs a new RGQLValueFinalize.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLValueFinalize);

        /** RGQLValueFinalize resultId. */
        public resultId: number;

        /**
         * Creates a new RGQLValueFinalize instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLValueFinalize instance
         */
        public static create(properties?: rgraphql.IRGQLValueFinalize): rgraphql.RGQLValueFinalize;

        /**
         * Encodes the specified RGQLValueFinalize message. Does not implicitly {@link rgraphql.RGQLValueFinalize.verify|verify} messages.
         * @param message RGQLValueFinalize message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLValueFinalize, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLValueFinalize message, length delimited. Does not implicitly {@link rgraphql.RGQLValueFinalize.verify|verify} messages.
         * @param message RGQLValueFinalize message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLValueFinalize, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLValueFinalize message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLValueFinalize
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLValueFinalize;

        /**
         * Decodes a RGQLValueFinalize message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLValueFinalize
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLValueFinalize;

        /**
         * Verifies a RGQLValueFinalize message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLValueFinalize message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLValueFinalize
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLValueFinalize;

        /**
         * Creates a plain object from a RGQLValueFinalize message. Also converts values to other types if specified.
         * @param message RGQLValueFinalize
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLValueFinalize, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLValueFinalize to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLQueryError. */
    interface IRGQLQueryError {

        /** RGQLQueryError queryId */
        queryId?: (number|null);

        /** RGQLQueryError queryNodeId */
        queryNodeId?: (number|null);

        /** RGQLQueryError error */
        error?: (string|null);
    }

    /** Represents a RGQLQueryError. */
    class RGQLQueryError implements IRGQLQueryError {

        /**
         * Constructs a new RGQLQueryError.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLQueryError);

        /** RGQLQueryError queryId. */
        public queryId: number;

        /** RGQLQueryError queryNodeId. */
        public queryNodeId: number;

        /** RGQLQueryError error. */
        public error: string;

        /**
         * Creates a new RGQLQueryError instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLQueryError instance
         */
        public static create(properties?: rgraphql.IRGQLQueryError): rgraphql.RGQLQueryError;

        /**
         * Encodes the specified RGQLQueryError message. Does not implicitly {@link rgraphql.RGQLQueryError.verify|verify} messages.
         * @param message RGQLQueryError message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLQueryError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLQueryError message, length delimited. Does not implicitly {@link rgraphql.RGQLQueryError.verify|verify} messages.
         * @param message RGQLQueryError message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLQueryError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLQueryError message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLQueryError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLQueryError;

        /**
         * Decodes a RGQLQueryError message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLQueryError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLQueryError;

        /**
         * Verifies a RGQLQueryError message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLQueryError message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLQueryError
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLQueryError;

        /**
         * Creates a plain object from a RGQLQueryError message. Also converts values to other types if specified.
         * @param message RGQLQueryError
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLQueryError, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLQueryError to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLValue. */
    interface IRGQLValue {

        /** RGQLValue queryNodeId */
        queryNodeId?: (number|null);

        /** RGQLValue arrayIndex */
        arrayIndex?: (number|null);

        /** RGQLValue posIdentifier */
        posIdentifier?: (number|null);

        /** RGQLValue value */
        value?: (rgraphql.IRGQLPrimitive|null);

        /** RGQLValue error */
        error?: (string|null);
    }

    /** Represents a RGQLValue. */
    class RGQLValue implements IRGQLValue {

        /**
         * Constructs a new RGQLValue.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLValue);

        /** RGQLValue queryNodeId. */
        public queryNodeId: number;

        /** RGQLValue arrayIndex. */
        public arrayIndex: number;

        /** RGQLValue posIdentifier. */
        public posIdentifier: number;

        /** RGQLValue value. */
        public value?: (rgraphql.IRGQLPrimitive|null);

        /** RGQLValue error. */
        public error: string;

        /**
         * Creates a new RGQLValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLValue instance
         */
        public static create(properties?: rgraphql.IRGQLValue): rgraphql.RGQLValue;

        /**
         * Encodes the specified RGQLValue message. Does not implicitly {@link rgraphql.RGQLValue.verify|verify} messages.
         * @param message RGQLValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLValue message, length delimited. Does not implicitly {@link rgraphql.RGQLValue.verify|verify} messages.
         * @param message RGQLValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLValue message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLValue;

        /**
         * Decodes a RGQLValue message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLValue;

        /**
         * Verifies a RGQLValue message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLValue message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLValue
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLValue;

        /**
         * Creates a plain object from a RGQLValue message. Also converts values to other types if specified.
         * @param message RGQLValue
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLValue to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a RGQLValueBatch. */
    interface IRGQLValueBatch {

        /** RGQLValueBatch resultId */
        resultId?: (number|null);

        /** RGQLValueBatch values */
        values?: (Uint8Array[]|null);
    }

    /** Represents a RGQLValueBatch. */
    class RGQLValueBatch implements IRGQLValueBatch {

        /**
         * Constructs a new RGQLValueBatch.
         * @param [properties] Properties to set
         */
        constructor(properties?: rgraphql.IRGQLValueBatch);

        /** RGQLValueBatch resultId. */
        public resultId: number;

        /** RGQLValueBatch values. */
        public values: Uint8Array[];

        /**
         * Creates a new RGQLValueBatch instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGQLValueBatch instance
         */
        public static create(properties?: rgraphql.IRGQLValueBatch): rgraphql.RGQLValueBatch;

        /**
         * Encodes the specified RGQLValueBatch message. Does not implicitly {@link rgraphql.RGQLValueBatch.verify|verify} messages.
         * @param message RGQLValueBatch message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rgraphql.IRGQLValueBatch, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGQLValueBatch message, length delimited. Does not implicitly {@link rgraphql.RGQLValueBatch.verify|verify} messages.
         * @param message RGQLValueBatch message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rgraphql.IRGQLValueBatch, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGQLValueBatch message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGQLValueBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rgraphql.RGQLValueBatch;

        /**
         * Decodes a RGQLValueBatch message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGQLValueBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rgraphql.RGQLValueBatch;

        /**
         * Verifies a RGQLValueBatch message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGQLValueBatch message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGQLValueBatch
         */
        public static fromObject(object: { [k: string]: any }): rgraphql.RGQLValueBatch;

        /**
         * Creates a plain object from a RGQLValueBatch message. Also converts values to other types if specified.
         * @param message RGQLValueBatch
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rgraphql.RGQLValueBatch, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGQLValueBatch to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
