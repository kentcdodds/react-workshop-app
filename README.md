<div align="center">
<h1>@kentcdodds/react-workshop-app</h1>

<p>An abstraction for all my React workshops</p>
</div>

---

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
<!-- prettier-ignore-end -->

## The problem

I have several repositories for
[my React workshops](https://kentcdodds.com/workshops)

## This solution

This is a set of common abstractions I found useful in those workshop
repositories

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
- [Contributors ✨](#contributors-)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```
npm install --save @kentcdodds/react-workshop-app
```

## Usage

This is intended to be used with create-react-app (but it doesn't have to be).

```javascript
// src/index.js
import codegen from 'codegen.macro'

// eslint-disable-next-line
codegen`module.exports = require('@kentcdodds/react-workshop-app/codegen')`

// src/setupTests.js
import '@kentcdodds/react-workshop-app/setup-tests'
```

Then you'll need to have those directories set up. Probably easiest to look at
one of my repos that use this.

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

## Contributors ✨

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kentcdodds.com"><img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=kentcdodds" title="Code">💻</a> <a href="https://github.com/kentcdodds/react-workshop-app/commits?author=kentcdodds" title="Documentation">📖</a> <a href="#infra-kentcdodds" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/kentcdodds/react-workshop-app/commits?author=kentcdodds" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/WojciechMatuszewski"><img src="https://avatars0.githubusercontent.com/u/26322927?v=4" width="100px;" alt=""/><br /><sub><b>Wojciech Matuszewski</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=WojciechMatuszewski" title="Code">💻</a> <a href="https://github.com/kentcdodds/react-workshop-app/commits?author=WojciechMatuszewski" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://zacjones.io"><img src="https://avatars2.githubusercontent.com/u/6188161?v=4" width="100px;" alt=""/><br /><sub><b>Zac Jones</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=zacjones93" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/marcosvega91"><img src="https://avatars2.githubusercontent.com/u/5365582?v=4" width="100px;" alt=""/><br /><sub><b>Marco Moretti</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=marcosvega91" title="Code">💻</a> <a href="https://github.com/kentcdodds/react-workshop-app/commits?author=marcosvega91" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/merodiro"><img src="https://avatars1.githubusercontent.com/u/17033502?v=4" width="100px;" alt=""/><br /><sub><b>Amr A.Mohammed</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=merodiro" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/gustavobmichel"><img src="https://avatars0.githubusercontent.com/u/14951413?v=4" width="100px;" alt=""/><br /><sub><b>Gustavo Borges Michel</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/issues?q=author%3Agustavobmichel" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Joyancefa"><img src="https://avatars2.githubusercontent.com/u/64249481?v=4" width="100px;" alt=""/><br /><sub><b>Joyancefa</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=Joyancefa" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Snaptags"><img src="https://avatars1.githubusercontent.com/u/1249745?v=4" width="100px;" alt=""/><br /><sub><b>Markus Lasermann</b></sub></a><br /><a href="https://github.com/kentcdodds/react-workshop-app/commits?author=Snaptags" title="Code">💻</a> <a href="https://github.com/kentcdodds/react-workshop-app/commits?author=Snaptags" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/com/kentcdodds/react-workshop-app.svg?style=flat-square
[build]: https://travis-ci.com/kentcdodds/react-workshop-app
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/react-workshop-app.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/react-workshop-app
[version-badge]: https://img.shields.io/npm/v/@kentcdodds/react-workshop-app.svg?style=flat-square
[package]: https://www.npmjs.com/package/@kentcdodds/react-workshop-app
[downloads-badge]: https://img.shields.io/npm/dm/@kentcdodds/react-workshop-app.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/@kentcdodds/react-workshop-app
[license-badge]: https://img.shields.io/npm/l/@kentcdodds/react-workshop-app.svg?style=flat-square
[license]: https://github.com/kentcdodds/react-workshop-app/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/react-workshop-app/blob/master/other/CODE_OF_CONDUCT.md
[emojis]: https://github.com/all-contributors/all-contributors#emoji-key
[all-contributors]: https://github.com/all-contributors/all-contributors
[bugs]: https://github.com/kentcdodds/react-workshop-app/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Acreated-desc+label%3Abug
[requests]: https://github.com/kentcdodds/react-workshop-app/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement
[good-first-issue]: https://github.com/kentcdodds/react-workshop-app/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement+label%3A%22good+first+issue%22
<!-- prettier-ignore-end -->
