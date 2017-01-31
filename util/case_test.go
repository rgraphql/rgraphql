package util

import (
	"testing"
)

func TestToPascal(t *testing.T) {
	expect := func(ostr string, tstr string) {
		actual := ToPascalCase(ostr)
		if actual != tstr {
			t.Fatalf("Expected %s -> %s, got %s", ostr, tstr, actual)
		}
	}

	expect("testIng", "TestIng")
	expect("test_this", "TestThis")
	expect("_test", "Test")
	expect("Test_", "Test")
	expect("test", "Test")
}
