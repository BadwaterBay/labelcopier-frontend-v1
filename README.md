# Labelcopier

Website: [https://badwaterbay.com/labelcopier/](https://badwaterbay.com/labelcopier/)

Repository: [https://github.com/BadwaterBay/labelcopier/](https://github.com/BadwaterBay/labelcopier/)

[![GitHub contributors](https://img.shields.io/github/contributors/BadwaterBay/labelcopier.svg)](https://GitHub.com/BadwaterBay/labelcopier/graphs/contributors/)
[![CodeFactor](https://www.codefactor.io/repository/github/badwaterbay/labelcopier/badge)](https://www.codefactor.io/repository/github/badwaterbay/labelcopier)
[![DeepScan grade](https://deepscan.io/api/teams/9440/projects/11965/branches/179826/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9440&pid=11965&bid=179826)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[![GitHub issues](https://img.shields.io/github/issues/BadwaterBay/labelcopier.svg)](https://GitHub.com/BadwaterBay/labelcopier/issues/)
[![GitHub issues-closed](https://img.shields.io/github/issues-closed/BadwaterBay/labelcopier.svg)](https://GitHub.com/BadwaterBay/labelcopier/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/BadwaterBay/labelcopier.svg)](https://GitHub.com/BadwaterBay/labelcopier/pulls/)
[![GitHub pull-requests closed](https://img.shields.io/github/issues-pr-closed/BadwaterBay/labelcopier.svg)](https://GitHub.com/BadwaterBay/labelcopier/pulls/)

---

## Table of contents

- [Thank you, contributors](#thank-you-contributors)
- [Description](#description)
- [Contributing to this project](#contributing-to-this-project)
- [License](#license)

---

## Thank you, contributors

We'd like to thank [all of our contributors](https://github.com/BadwaterBay/labelcopier/graphs/contributors).

---

## Description

This web app helps you manage labels and milestones of your GitHub repositories.

This project was originally forked from [here](https://github.com/destan/github-label-manager) in early 2020. However, since it hadn't been updated since 2016, we took it into our own hands to fix bugs and add new features requested by the GitHub community.

We are proud to continue developing and maintaining this open-source project for the community. We have made significant improvements:

- Add functionalities to manage milestones in addition to labels.
- Authenticate as a GitHub OAuth App, instead of manually input the password or a personal access token.
- Display labels and milestones in sorted alphabetical order.
- Replaced jQuery Ajax with JavaScript's native Fetch API in promise style.
- Fire API calls asynchronously in parallel to improve the efficiency by over 100%.
- Added data validation before committing changes.
- Refined the UI to a modern and responsive design with meticulous attention to details.
- Upgraded from Bootstrap 2 to Bootstrap 4 with Material Design.
- Upgraded from jQuery 1.x.x to the latest jQuery 3.x.x.
- Partially converted jQuery to vanilla JavaScript.
- The code is modularized and bundled by Webpack to create a production build.
- Fixed numerous bugs.
- Many more features to come.

---

## Contributing to this project

Please refer to our [Contributing Guidelines](https://github.com/BadwaterBay/labelcopier/blob/master/CONTRIBUTING.md).

There are many features to add and potential bugs to fix.

We welcome contributions. Please claim an issue and submit a pull request to resolve it.

We also welcome [feature requests, bug reports and questions](https://github.com/BadwaterBay/labelcopier/issues).

---

## License

GPLv3

labelcopier is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

labelcopier is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with labelcopier. If not, see <http://www.gnu.org/licenses/>.
