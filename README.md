X Core
================

[X Core](http://internxt.io) is a cross-platform desktop application enabling users to earn money
by sharing their extra hard drive space on the [Internxt](http://internxt.io) network.

If you wish to build from source, follow the instructions below.

### Prerequisites

* [Git](https://git-scm.org)
* [Node.js 8.x.x](https://nodejs.org)
* [node-gyp](https://github.com/nodejs/node-gyp)

> If you do not have [Node.js](https://nodejs.org) installed already, install
> it with [NVM](https://github.com/creationix/nvm).

### Setup

Clone this repository and install dependencies with NPM.

```bash
git clone https://github.com/internxt/x-core && cd x-core
npm install
```

Then you can start the application.

```bash
npm --production start
```

Development
-----------

Unlike a traditional Node.js project, this one has 2 separate `package.json`
files: `package.json` and `app/package.json`. The one in the root directory
only contains dependencies for the [Electron](https://electronjs.org)-based
build system. It is unlikely that you will need to modify this.

Building
--------

You can package a release for GNU/Linux, OSX, and Windows, by running the
following from the project's root directory.

```bash
npm run release
```

Once completed, your bundle will be placed in `releases/`. You can only bundle
a release for the operating system on which you are running, so in order to
build for all supported platforms, you will need to have access to each
operating system.

You can use [xdissent/ievms](https://github.com/xdissent/ievms) to setup a
virtual machine for Windows if you are on GNU/Linux or OSX. If you are running
GNU/Linux, there are a number of resources available for setting up a virtual
machine for OSX.

> On Windows, [NSIS](http://nsis.sourceforge.net/Main_Page) is used. You have
> to install it (version 3.0), and add NSIS folder to PATH in environment
> variables, so it is reachable to scripts in this project (path should look
> something like `C:/Program Files (x86)/NSIS`).

License
-------
```
X Core - Cross-platform desktop application fop sharing user's extra hard drive space.
Copyright (c) 2017 Internxt.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
```