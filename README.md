# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

# Usage

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
    if: ${{ github.event.pull_request.base.ref == 'prod' || github.event_name == 'workflow_dispatch' || github.event_name == 'schedule' }}
    runs-on: ubuntu-latest
    steps:
      - uses: linzhengen/release-pr-creator@v0.1.2
```
