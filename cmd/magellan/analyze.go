package main

import (
	"bytes"
	"fmt"
	"go/build"
	"go/format"
	"go/parser"
	"io/ioutil"
	"os"

	"github.com/pkg/errors"
	"github.com/rgraphql/magellan/analysis"
	"github.com/rgraphql/magellan/schema"
	"github.com/urfave/cli"
	"golang.org/x/tools/go/loader"
)

// .\magellan.exe analyze --schema ..\..\example\simple\schema.graphql --go-pkg "github.com/rgraphql/magellan/example/simple" --go-query-type RootResolver --go-output "../../example/simple/resolve/resolve_generated.go"

var analyzeArgs struct {
	// SchemaPath is the path to the graphql schema file.
	SchemaPath string
	// PackagePath is the path to the Go package.
	PackagePath string
	// QueryType is the name of the root query type in Go.
	QueryType string
	// OutputPath is the path to the output go file.
	OutputPath string
}

func init() {
	Commands = append(Commands, cli.Command{
		Name:   "analyze",
		Usage:  "builds an execution model from a schema and Go codebase",
		Action: runAnalyze,

		Flags: []cli.Flag{
			cli.StringFlag{
				Name:        "schema",
				Usage:       "path to graphql schema file",
				Destination: &analyzeArgs.SchemaPath,
			},
			cli.StringFlag{
				Name:        "go-pkg",
				Usage:       "import path of the go package",
				Destination: &analyzeArgs.PackagePath,
			},
			cli.StringFlag{
				Name:        "go-query-type",
				Usage:       "the query type in Go",
				Destination: &analyzeArgs.QueryType,
			},
			cli.StringFlag{
				Name:        "go-output",
				Usage:       "path to go output file",
				Destination: &analyzeArgs.OutputPath,
			},
		},
	})
}

// runAnalyze runs the analyze subcommand
func runAnalyze(c *cli.Context) error {
	queryTypeName := analyzeArgs.QueryType
	if len(queryTypeName) == 0 {
		return errors.New("specify a go-query-type to use")
	}

	schemaPath := analyzeArgs.SchemaPath
	if schemaPath == "" {
		return errors.New("schema path must be specified")
	}

	goPkgPath := analyzeArgs.PackagePath
	if goPkgPath == "" {
		return errors.New("go package path must be specified")
	}

	doc, err := ioutil.ReadFile(schemaPath)
	if err != nil {
		return errors.Wrap(err, "unable to read schema")
	}

	scm, err := schema.Parse(string(doc))
	if err != nil {
		return errors.Wrap(err, "unable to parse schema")
	}

	// Build starting from the root query.
	rootQuery := scm.Definitions.RootQuery
	if rootQuery == nil {
		return errors.New("schema.query must be defined in schema")
	}

	builderCtx := build.Default
	builderCtx.BuildTags = append(builderCtx.BuildTags, "magellan_analyze")

	var conf loader.Config
	conf.Build = &builderCtx
	conf.ParserMode |= parser.ParseComments | parser.AllErrors
	conf.Import(analyzeArgs.PackagePath)
	conf.Cwd, _ = os.Getwd()

	prog, err := conf.Load()
	if err != nil {
		return errors.Wrap(err, "unable to load go program")
	}

	initPkgList := prog.InitialPackages()
	if len(initPkgList) != 1 {
		return errors.Errorf("expected 1 package to be imported, got %d", len(initPkgList))
	}
	initPkg := initPkgList[0]

	pkgScope := initPkg.Pkg.Scope()
	rootQueryGoObj := pkgScope.Lookup(queryTypeName)
	if rootQueryGoObj == nil {
		return errors.Errorf("couldn't find go type definition %s", queryTypeName)
	}
	rootQueryType := rootQueryGoObj.Type()

	// Begin analyzing.
	model, err := analysis.BuildModel(rootQuery, scm.Definitions, rootQueryType)
	if err != nil {
		return err
	}

	fmt.Printf("Generated model successfully.\n")
	var outDat bytes.Buffer
	outDat.WriteString("//+build !magellan_analyze\n\n")
	outFile, err := model.GenerateResolverFile()
	if err != nil {
		return err
	}
	err = format.Node(&outDat, prog.Fset, outFile)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(analyzeArgs.OutputPath, outDat.Bytes(), 0644)
}
