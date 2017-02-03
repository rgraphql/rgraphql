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
            "jsonValue": {
              "type": "string",
              "id": 2
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
            "nodeMutation": {
              "rule": "repeated",
              "type": "NodeMutation",
              "id": 1
            },
            "variables": {
              "rule": "repeated",
              "type": "ASTVariable",
              "id": 2
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
