/* tslint:disable:trailing-comma */
/* tslint:disable:quotemark */
/* tslint:disable:max-line-length */
export const PROTO_DEFINITIONS = {
  "nested": {
    "rgraphql": {
      "nested": {
        "RGQLQueryFieldDirective": {
          "fields": {
            "name": {
              "type": "string",
              "id": 1
            },
            "args": {
              "rule": "repeated",
              "type": "FieldArgument",
              "id": 2
            }
          }
        },
        "RGQLQueryTreeNode": {
          "fields": {
            "id": {
              "type": "uint32",
              "id": 1
            },
            "fieldName": {
              "type": "string",
              "id": 2
            },
            "args": {
              "rule": "repeated",
              "type": "FieldArgument",
              "id": 3
            },
            "directive": {
              "rule": "repeated",
              "type": "RGQLQueryFieldDirective",
              "id": 4
            },
            "children": {
              "rule": "repeated",
              "type": "RGQLQueryTreeNode",
              "id": 5
            }
          }
        },
        "FieldArgument": {
          "fields": {
            "name": {
              "type": "string",
              "id": 1
            },
            "value": {
              "type": "ASTValue",
              "id": 2
            }
          }
        },
        "ASTValue": {
          "fields": {
            "stringValue": {
              "type": "string",
              "id": 1
            },
            "listValue": {
              "rule": "repeated",
              "type": "ASTValue",
              "id": 2
            },
            "intValue": {
              "type": "int32",
              "id": 3
            },
            "floatValue": {
              "type": "float",
              "id": 4
            },
            "boolValue": {
              "type": "bool",
              "id": 5
            },
            "objectFields": {
              "rule": "repeated",
              "type": "ASTObjectField",
              "id": 6
            },
            "kind": {
              "type": "ASTValueKind",
              "id": 7
            }
          },
          "nested": {
            "ASTValueKind": {
              "values": {
                "AST_VALUE_NULL": 0,
                "AST_VALUE_STRING": 1,
                "AST_VALUE_ENUM": 2,
                "AST_VALUE_INT": 3,
                "AST_VALUE_FLOAT": 4,
                "AST_VALUE_BOOL": 5,
                "AST_VALUE_LIST": 6,
                "AST_VALUE_OBJECT": 7
              }
            },
            "ASTObjectField": {
              "fields": {
                "key": {
                  "type": "string",
                  "id": 1
                },
                "value": {
                  "type": "ASTValue",
                  "id": 2
                }
              }
            }
          }
        },
        "RGQLClientMessage": {
          "fields": {
            "mutateTree": {
              "type": "RGQLTreeMutation",
              "id": 1
            },
            "mutateField": {
              "type": "RGQLFieldMutation",
              "id": 2
            }
          }
        },
        "RGQLTreeMutation": {
          "fields": {
            "nodeId": {
              "type": "uint32",
              "id": 1
            },
            "operation": {
              "type": "SubtreeOperation",
              "id": 2
            },
            "node": {
              "type": "RGQLQueryTreeNode",
              "id": 3
            }
          },
          "nested": {
            "SubtreeOperation": {
              "values": {
                "SUBTREE_ADD_CHILD": 0,
                "SUBTREE_DELETE": 1
              }
            }
          }
        },
        "RGQLFieldMutation": {
          "fields": {
            "nodeId": {
              "type": "uint32",
              "id": 1
            }
          }
        },
        "RGQLServerMessage": {
          "fields": {
            "mutateValue": {
              "type": "RGQLValueMutation",
              "id": 1
            }
          }
        },
        "RGQLValueMutation": {
          "fields": {
            "valueNodeId": {
              "type": "uint32",
              "id": 1
            },
            "parentValueNodeId": {
              "type": "uint32",
              "id": 2
            },
            "queryNodeId": {
              "type": "uint32",
              "id": 3
            },
            "operation": {
              "type": "ValueOperation",
              "id": 4
            },
            "valueJson": {
              "type": "string",
              "id": 5
            }
          },
          "nested": {
            "ValueOperation": {
              "values": {
                "VALUE_SET": 0,
                "VALUE_ERROR": 1,
                "VALUE_DELETE": 2
              }
            }
          }
        }
      }
    }
  }
};
