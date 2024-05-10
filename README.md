# release-pr-creator

[![Lint Codebase](https://github.com/linzhengen/release-pr-creator/actions/workflows/linter.yml/badge.svg)](https://github.com/linzhengen/release-pr-creator/actions/workflows/linter.yml)
[![Continuous Integration](https://github.com/linzhengen/release-pr-creator/actions/workflows/ci.yml/badge.svg)](https://github.com/linzhengen/release-pr-creator/actions/workflows/ci.yml)
[![CodeQL](https://github.com/linzhengen/release-pr-creator/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/linzhengen/release-pr-creator/actions/workflows/codeql-analysis.yml)
[![Check Transpiled JavaScript](https://github.com/linzhengen/release-pr-creator/actions/workflows/check-dist.yml/badge.svg)](https://github.com/linzhengen/release-pr-creator/actions/workflows/check-dist.yml)

Create a pull request for a release branch

## Usage

```yaml
name: main-to-prod-pr-creator

on:
  schedule:
    - cron: '0 1 * * *'
  pull_request:
    branches:
      - main
      - prod
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  create-main-to-prod-pr:
    if:
      ${{ github.event.pull_request.base.ref == 'prod' || github.event_name ==
      'workflow_dispatch' || github.event_name == 'schedule' }}
    runs-on: ubuntu-latest
    steps:
      - uses: linzhengen/release-pr-creator@v0.1.7
```
