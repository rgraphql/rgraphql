package example

import "context"

type MyStringVal string

type MyString *MyStringVal

type RootResolver struct{}

// GetNames returns the names of the people.
func (r *RootResolver) GetNames(ctx context.Context, outCh chan<- string) error {
	outCh <- "test1"
	outCh <- "test2"
	return nil
}

type GetAgeArgs struct {
	Name string
}

// GetAge returns the age of the person by name.
func (r *RootResolver) GetAge(args *GetAgeArgs) (int, error) {
	_ = args.Name
	return 22, nil
}
