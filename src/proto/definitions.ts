/* tslint:disable:trailing-comma */
/* tslint:disable:quotemark */
/* tslint:disable:max-line-length */
export const PROTO_DEFINITIONS = {
  "nested": {
    "rgraphql": {
      "nested": {
        "RGQLQueryFieldDirective": {
          "fields": {
            "kind": {
              "type": "EDirectiveKind",
              "id": 1
            },
            "argsJson": {
              "type": "string",
              "id": 2
            }
          },
          "nested": {
            "EDirectiveKind": {
              "values": {
                "DIRECTIVE_NONE": 0,
                "DIRECTIVE_LIVE": 1
              }
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
            "argsJson": {
              "type": "string",
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
        }
      }
    }
  }
};
