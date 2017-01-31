package util

import (
	"unicode"
)

func ToPascalCase(title string) string {
	result := make([]rune, len(title))
	nextUpper := false
	ri := 0
	for i, r := range title {
		to := r
		if r == '_' {
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
