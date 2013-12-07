wolfram
=======

IRC bot

----------

Tests
-----

To run tests type `npm test` in the node console at the root of the project.
In case your environment has make installed you can also type `make test`.
The `npm test` command is in fact only invoking a command (`mocha -R list`) defined under the `script` attribute in the `package.json` file.

[Mocha][1] is used as testframework, and [should][2] is used for assertions.


  [1]: http://visionmedia.github.io/mocha/
  [2]: https://github.com/visionmedia/should.js