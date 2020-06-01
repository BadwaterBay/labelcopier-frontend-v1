# Github Label Manager 2

[![CodeFactor](https://www.codefactor.io/repository/github/BadwaterBay/github-label-manager-2/badge)](https://www.codefactor.io/repository/github/BadwaterBay/github-label-manager-2)
[![DeepScan grade](https://deepscan.io/api/teams/9440/projects/11965/branches/179826/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9440&pid=11965&bid=179826)
[![GitHub contributors](https://img.shields.io/github/contributors/BadwaterBay/github-label-manager-2.svg)](https://GitHub.com/BadwaterBay/github-label-manager-2/graphs/contributors/)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

---

## Description

This web app helps you manage labels and milestones of your GitHub repositories.

This project was adopted from [here](https://github.com/destan/github-label-manager). However, since that project hasn't been updated since 2016, we'd like to take this project into our own hands and continue developing and maintaining this open-source project for the community.

We have made significant improvements since then:

[![GitHub issues](https://img.shields.io/github/issues/BadwaterBay/github-label-manager-2.svg)](https://GitHub.com/BadwaterBay/github-label-manager-2/issues/)
[![GitHub issues-closed](https://img.shields.io/github/issues-closed/BadwaterBay/github-label-manager-2.svg)](https://GitHub.com/BadwaterBay/github-label-manager-2/issues?q=is%3Aissue+is%3Aclosed)

[![GitHub pull-requests](https://img.shields.io/github/issues-pr/BadwaterBay/github-label-manager-2.svg)](https://GitHub.com/BadwaterBay/github-label-manager-2/pull/)
[![GitHub pull-requests closed](https://img.shields.io/github/issues-pr-closed/BadwaterBay/github-label-manager-2.svg)](https://GitHub.com/BadwaterBay/github-label-manager-2/pull/)

---

## Contribute to this project

We welcome contributors.

Take on an issue and submit a pull request to resolve the issue.

[Request new feature or report bugs.](https://github.com/BadwaterBay/github-label-manager-2/issues)

Questions are welcome.

---

## Development

### Initial setup

- Install Node with the package manager of your choice and npm.
- Clone this repository.
- Change directory to the project's root directory, use command `npm ci` to install all node dependencies in your local environment.

### Tools

- Linting using Eslint:
  - Use `npm run lint` to see issues without writing to files. It runs `eslint . --fix-dry-run`
  - Use `npm run lint-fix` to let Eslint fix problems and write to files. It runs `eslint . --fix`
  - When you git-commit, it will automatically trigger `npm run lint`
- Formatting using Prettier:
  - Use `npm run format` to automatically format all files and save changes to them
  - When you git-commit, it will automatically trigger `npm run format`

---

## License

GPLv3

github-label-manager-2 is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

github-label-manager-2 is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with github-label-manager. If not, see <http://www.gnu.org/licenses/>.
