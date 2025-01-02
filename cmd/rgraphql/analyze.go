package main

import (
	"bytes"
	"fmt"
	"go/build"
	"go/format"
	"go/token"
	"os"

	"github.com/pkg/errors"
	"github.com/rgraphql/rgraphql/analysis"
	"github.com/rgraphql/rgraphql/schema"
	"github.com/urfave/cli/v2"
	"golang.org/x/tools/go/packages"
	"golang.org/x/tools/imports"
)

// .\rgraphql.exe analyze --schema ..\..\example\simple\schema.graphql --go-pkg "github.com/rgraphql/rgraphql/example/simple" --go-query-type RootResolver --go-output "../../example/simple/resolve/resolve_rgql.go"

var analyzeArgs struct {
	// SchemaPath is the path to the graphql schema file.
	SchemaPath string
	// PackagePath is the path to the Go package.
	PackagePath string
	// QueryType is the name of the root query type in Go.
	QueryType string
	// OutputPath is the path to the output go file.
	OutputPath string
	// OutputPackageName is the package name for the output go file.
	OutputPackageName string
}

func init() {
	Commands = append(Commands, &cli.Command{
		Name:   "analyze",
		Usage:  "builds an execution model from a schema and Go codebase",
		Action: runAnalyze,

		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "schema",
				Usage:       "path to graphql schema file",
				Destination: &analyzeArgs.SchemaPath,
			},
			&cli.StringFlag{
				Name:        "go-pkg",
				Usage:       "import path of the go package",
				Destination: &analyzeArgs.PackagePath,
			},
			&cli.StringFlag{
				Name:        "go-query-type",
				Usage:       "the query type in Go",
				Destination: &analyzeArgs.QueryType,
			},
			&cli.StringFlag{
				Name:        "go-output",
				Usage:       "path to go output file",
				Destination: &analyzeArgs.OutputPath,
			},
			&cli.StringFlag{
				Name:        "go-output-pkg",
				Usage:       "name of the output package, defaults to resolve",
				Destination: &analyzeArgs.OutputPackageName,
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

	doc, err := os.ReadFile(schemaPath)
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
	builderCtx.BuildTags = append(builderCtx.BuildTags, "rgraphql_analyze")

	fset := &token.FileSet{}
	conf := &packages.Config{
		BuildFlags: []string{"-tags", "rgraphql_analyze"},
		Fset:       fset,
		Mode:       packages.NeedTypes,
	}

	pkgs, err := packages.Load(conf, analyzeArgs.PackagePath)
	if err != nil || len(pkgs) == 0 {
		return errors.Wrap(err, "unable to load go program")
	}

	initPkg := pkgs[0]
	pkgScope := initPkg.Types.Scope()
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

	outputPackageName := analyzeArgs.OutputPackageName
	if outputPackageName == "" {
		outputPackageName = "resolve"
	}

	fmt.Printf("Generated model successfully.\n")
	var outDat bytes.Buffer
	outDat.WriteString("//+build !rgraphql_analyze\n\n")
	outFile, err := model.GenerateResolverFile(outputPackageName)
	if err != nil {
		return err
	}
	err = format.Node(&outDat, fset, outFile)
	if err != nil {
		return err
	}
	outFormatted, err := imports.Process(analyzeArgs.OutputPath, outDat.Bytes(), nil)
	if err != nil {
		return err
	}
	return os.WriteFile(analyzeArgs.OutputPath, outFormatted, 0o644)
}
