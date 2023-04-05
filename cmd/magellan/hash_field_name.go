package main

import (
	"errors"
	"fmt"

	"github.com/rgraphql/magellan/schema"
	"github.com/urfave/cli/v2"
)

var hashFieldNameStr string

func init() {
	Commands = append(Commands, &cli.Command{
		Name:  "hash-field-name",
		Usage: "hash a field name to a uint32 value",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "field",
				Usage:       "field name to hash",
				Destination: &hashFieldNameStr,
			},
		},
		Action: runHashFieldName,
	})
}

// runHashFieldName runs the hash field name subcommand
func runHashFieldName(c *cli.Context) error {
	if hashFieldNameStr == "" {
		return errors.New("--field must be set")
	}

	v := schema.HashFieldName(hashFieldNameStr)
	fmt.Printf("%v\n", v)
	return nil
}
