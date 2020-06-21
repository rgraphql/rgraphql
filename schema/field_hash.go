package schema

import (
	"hash/crc32"
)

// HashFieldName returns a integer hash for the field name.
func HashFieldName(fieldName string) uint32 {
	return crc32.ChecksumIEEE([]byte(fieldName))
}
