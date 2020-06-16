# GitHub Label Manager Plus

[![CodeFactor](https://www.codefactor.io/repository/github/badwaterbay/github-label-manager-plus/badge)](https://www.codefactor.io/repository/github/badwaterbay/github-label-manager-plus)
[![DeepScan grade](https://deepscan.io/api/teams/9440/projects/11965/branches/179826/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9440&pid=11965&bid=179826)
[![GitHub contributors](https://img.shields.io/github/contributors/BadwaterBay/github-label-manager-plus.svg)](https://GitHub.com/BadwaterBay/github-label-manager-plus/graphs/contributors/)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Hosted at: [https://badwaterbay.com/app/github-label-manager-plus/](https://badwaterbay.com/app/github-label-manager-plus/)

Repository: [https://github.com/BadwaterBay/github-label-manager-plus/](https://github.com/BadwaterBay/github-label-manager-plus/)

---

## Description

This web app helps you manage labels and milestones of your GitHub repositories.

This project was originally forked from [here](https://github.com/destan/github-label-manager) in early 2020. However, since it hadn't been updated since 2016, we took it into our own hands to fix bugs and add new features requested by the GitHub community.

We are proud to continue developing and maintaining this open-source project for the community. We have made significant improvements:

- Fixed numerous bugs
- Now you can manage milestones
- Added data validation before committing changes
- Refined the UI to a modern, responsive design with meticulous attention to details
- Upgraded from Bootstrap 2 to Bootstrap 4 with Material Design
- Upgraded from JQuery 1.x.x to the latest JQuery 3.x.x
- Many more features

Vist our issue and pull request websites:

[![GitHub issues](https://img.shields.io/github/issues/BadwaterBay/github-label-manager-plus.svg)](https://GitHub.com/BadwaterBay/github-label-manager-plus/issues/)
[![GitHub issues-closed](https://img.shields.io/github/issues-closed/BadwaterBay/github-label-manager-plus.svg)](https://GitHub.com/BadwaterBay/github-label-manager-plus/issues?q=is%3Aissue+is%3Aclosed)

[![GitHub pull-requests](https://img.shields.io/github/issues-pr/BadwaterBay/github-label-manager-plus.svg)](https://GitHub.com/BadwaterBay/github-label-manager-plus/pulls/)
[![GitHub pull-requests closed](https://img.shields.io/github/issues-pr-closed/BadwaterBay/github-label-manager-plus.svg)](https://GitHub.com/BadwaterBay/github-label-manager-plus/pulls/)

---

## Contribute to this project

There are many features to add and potential bugs to fix.

We welcome contributions. Please claim an issue and submit a pull request to resolve it.

We also welcome [feature requests, bug reports and questions](https://github.com/BadwaterBay/github-label-manager-plus/issues).

---

## Development

### Initial setup

- Prerequisites: having [Node.js](https://nodejs.org/en/) and the latest [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) installed on your machine.
- Clone this repository. [How to clone a repository?](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository)
- Change directory to the project's root directory, run command `yarn --frozen-lockfile` to install all dependencies. This might take a while.

### Commands

- Run a local server out for development:
  - `yarn dev` will trigger `browser-sync` to serve files from `/src`
- Formatting using Prettier:
  - `yarn format` will format files with Prettier and save changes.
  - Tip: when you git-commit, `yarn format` will be automatically triggrred.
- Linting using Eslint:
  - `yarn lint` will run Eslint to check the code quality. Please try to resolve these issues before commiting any changes.
  - `yarn lint-fix` to let Eslint fix problems and write to files.
  - Tip: when you git-commit, `yarn lint` will be automatically triggrred.
- Run tests:
  - `yarn test` will run preset tests. However, this is a dummy for now, because we haven't written any tests yet. This is to show that we are aware of the importance of unit testing.
- Create a production build:
  - `yarn build` will generate a production build in directory `/build`.

---

## License

GPLv3

github-label-manager-plus is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

github-label-manager-plus is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with github-label-manager-plus. If not, see <http://www.gnu.org/licenses/>.
