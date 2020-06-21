package client

import (
	"github.com/pkg/errors"
)

// fieldNotFoundErr returns an error when a field is not found on a type name.
func fieldNotFoundErr(fieldName, typeName string) error {
	return errors.Errorf(
		"field %s not found on type %s",
		fieldName,
		typeName,
	)
}

// typeNotFoundErr returns an error indicating a type couldn't be found by name.
func typeNotFoundErr(typeName string) error {
	return errors.Errorf("type %s not found", typeName)
}
