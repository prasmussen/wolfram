wolfram
=======

IRC bot

Installation
-----

**Development**

    $git clone .....wolfram.git
    $npm install
    
Now you can play around with the code and test it via unit tests described in the **Test** section.

**Production**

Wolfram uses [couchdb][1] for the backend. Install couchdb "runtime" for whatever environment you are using.
After installation you can manage your couchdb at the http://localhost:5984 address in your browser aka [Futon][2].

> NOTE: CouchDB, by default, is completely open, giving every user admin
> rights to the instance and all its databases. This is great for
> development but obviously bad for production. Let’s go ahead and setup
> an admin. In the bottom right, you will see “Welcome to Admin Party!
> Everyone is admin! Fix this”.

Now make a copy of the `wolfram.config.default` file and call it `wolfram.config`, edit the configuration file to fit your needs.

Open Futon and create a new `database`. Give it the name you put in the configuration file.
Second add a new user also matching your configurations, `username` and `password`.

If you skiped the development section, here is a recap

    $git clone .....wolfram.git
    $npm install
    $node_modules\.bin\couchapp push setup-couchdb.js http://username:password@localhost:5984/dbname

Now the database should be up an running! Now you can start the backend.js and client.js

    $node backend.js
    $node client.js

Wolfram should connect to irc and join the channels specified in the configuration file.

Tests
-----

To run tests type `npm test` in the node console at the root of the project.
In case your environment has make installed you can also type `make test`.
The `npm test` command is in fact only invoking a command (`mocha -R list`) defined under the `script` attribute in the `package.json` file.

[Mocha][4] is used as test framework, and [should][5] is used for assertions.


  [1]: http://couchdb.apache.org/
  [2]: http://docs.couchdb.org/en/latest/intro/tour.html#welcome-to-futon
  [3]: http://wiki.apache.org/couchdb/How_to_create_users_via_script
  [4]: http://mochajs.org/
  [5]: https://github.com/visionmedia/should.js
