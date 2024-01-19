package main

import (
	"os"

	"github.com/urfave/cli/v2"
)

// Commands contains the top-level commands.
var Commands []*cli.Command

func main() {
	app := cli.NewApp()
	app.Name = "rgraphql"
	app.Usage = "tools and compiler for rgraphql"
	app.HideVersion = true
	app.Commands = Commands

	if err := app.Run(os.Args); err != nil {
		os.Stderr.WriteString(err.Error())
		os.Stderr.WriteString("\n")
		os.Exit(1)
	}
}
