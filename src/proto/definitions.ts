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
            "variableId": {
              "type": "uint32",
              "id": 2
            }
          }
        },
        "ASTVariable": {
          "fields": {
            "id": {
              "type": "uint32",
              "id": 1
            },
            "value": {
              "type": "RGQLPrimitive",
              "id": 2
            }
          }
        },
        "RGQLPrimitive": {
          "fields": {
            "kind": {
              "type": "Kind",
              "id": 1
            },
            "intValue": {
              "type": "int32",
              "id": 2
            },
            "floatValue": {
              "type": "double",
              "id": 3
            },
            "stringValue": {
              "type": "string",
              "id": 4
            },
            "binaryValue": {
              "type": "bytes",
              "id": 5
            },
            "boolValue": {
              "type": "bool",
              "id": 6
            }
          },
          "nested": {
            "Kind": {
              "values": {
                "PRIMITIVE_KIND_NULL": 0,
                "PRIMITIVE_KIND_INT": 1,
                "PRIMITIVE_KIND_FLOAT": 2,
                "PRIMITIVE_KIND_STRING": 3,
                "PRIMITIVE_KIND_BOOL": 4,
                "PRIMITIVE_KIND_BINARY": 5,
                "PRIMITIVE_KIND_OBJECT": 6,
                "PRIMITIVE_KIND_ARRAY": 7
              }
            }
          }
        },
        "RGQLClientMessage": {
          "fields": {
            "initQuery": {
              "type": "RGQLQueryInit",
              "id": 1
            },
            "mutateTree": {
              "type": "RGQLQueryTreeMutation",
              "id": 2
            },
            "finishQuery": {
              "type": "RGQLQueryFinish",
              "id": 3
            }
          }
        },
        "RGQLQueryInit": {
          "fields": {
            "queryId": {
              "type": "uint32",
              "id": 1
            },
            "forceSerial": {
              "type": "bool",
              "id": 2
            },
            "operationType": {
              "type": "string",
              "id": 3
            }
          }
        },
        "RGQLQueryTreeMutation": {
          "fields": {
            "queryId": {
              "type": "uint32",
              "id": 1
            },
            "nodeMutation": {
              "rule": "repeated",
              "type": "NodeMutation",
              "id": 2
            },
            "variables": {
              "rule": "repeated",
              "type": "ASTVariable",
              "id": 3
            }
          },
          "nested": {
            "NodeMutation": {
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
              }
            },
            "SubtreeOperation": {
              "values": {
                "SUBTREE_ADD_CHILD": 0,
                "SUBTREE_DELETE": 1
              }
            }
          }
        },
        "RGQLQueryFinish": {
          "fields": {
            "queryId": {
              "type": "uint32",
              "id": 1
            }
          }
        },
        "RGQLServerMessage": {
          "fields": {
            "queryError": {
              "type": "RGQLQueryError",
              "id": 2
            },
            "valueInit": {
              "type": "RGQLValueInit",
              "id": 4
            },
            "valueBatch": {
              "type": "RGQLValueBatch",
              "id": 5
            },
            "valueFinalize": {
              "type": "RGQLValueFinalize",
              "id": 6
            }
          }
        },
        "RGQLValueInit": {
          "fields": {
            "resultId": {
              "type": "uint32",
              "id": 1
            },
            "queryId": {
              "type": "uint32",
              "id": 2
            },
            "cacheStrategy": {
              "type": "CacheStrategy",
              "id": 3
            },
            "cacheSize": {
              "type": "uint32",
              "id": 4
            }
          },
          "nested": {
            "CacheStrategy": {
              "values": {
                "CACHE_LRU": 0
              }
            }
          }
        },
        "RGQLValueFinalize": {
          "fields": {
            "resultId": {
              "type": "uint32",
              "id": 1
            }
          }
        },
        "RGQLQueryError": {
          "fields": {
            "queryId": {
              "type": "uint32",
              "id": 1
            },
            "queryNodeId": {
              "type": "uint32",
              "id": 2
            },
            "error": {
              "type": "string",
              "id": 3
            }
          }
        },
        "RGQLValue": {
          "fields": {
            "queryNodeId": {
              "type": "uint32",
              "id": 1
            },
            "arrayIndex": {
              "type": "uint32",
              "id": 2
            },
            "posIdentifier": {
              "type": "uint32",
              "id": 3
            },
            "value": {
              "type": "RGQLPrimitive",
              "id": 4
            },
            "error": {
              "type": "string",
              "id": 5
            }
          }
        },
        "RGQLValueBatch": {
          "fields": {
            "resultId": {
              "type": "uint32",
              "id": 1
            },
            "values": {
              "rule": "repeated",
              "type": "bytes",
              "id": 2
            }
          }
        }
      }
    }
  }
};
