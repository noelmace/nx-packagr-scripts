## Contributing

## Got a Question?

Please don't hesitate to open a GitHub issue for bug reports, feature requests, or questions about this project _only_. Stack Overflow is a much better place to ask general questions about how to use Nx or ng-packagr.

## Code format

Please be sure to respect our code conventions (eslint, editorconfig and prettier). A commit hook (`npm run precommit`) is here to help you and travis permit to check if your PR respect all requirements. If you're not sure, you can always run `npm run lint` to check if your branch respect the code format requirements, or `npm run pretty` to fix it.

## Commit Message Guidelines

Commit message should follow the [Angular conventions](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).

```
type(scope): subject
BLANK LINE
body
```

#### Type

The type must be one of the following:

* build
* feat
* fix
* refactor
* style
* docs
* test

#### Scope

The scope must be one of the following:

* build
* publish
* steps
* utils

#### Subject

The subject must contain a description of the change.

#### Example

```
feat(build): add an option to permit to debug the build process

`pk4nx build -d` permit to output debug logs to the console
```
