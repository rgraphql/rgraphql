package util

import (
	"unicode"
)

// ToPascalCase converts title from _snake_case or camelCase to PascalCase
func ToPascalCase(title string) string {
	result := make([]rune, len(title))
	nextUpper := false
	ri := 0
	for i, r := range title {
		to := r
		if r == '_' || r == ' ' {
			nextUpper = true
			continue
		} else if i == 0 || nextUpper {
			to = unicode.ToUpper(to)
			nextUpper = false
		}
		result[ri] = to
		ri++
	}

	return string(result[0:ri])
}
