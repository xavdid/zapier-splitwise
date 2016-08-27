# zapier-splitwise

A [Zapier](https://zapier.com) app that gives access to the [Splitwise API](http://dev.splitwise.com/). This versions is built for Zapier platform 2.

## Current Features

Triggers:
* New Expense

Actions:
* Create a New Expense

If you've got suggestions, feel free to open an issue!

## Making a Zapier App

In the current state of the world, it's tricky to use node modules within zapier apps. There's also no concept of environment variables. Depending on your task, this matters either a lot or a little and in the case of Splitwise (and their OAuth 1.0 authentication), it's a pain in the butt. Luckily, it's fixable.

### Bundles

[Rollup](https://github.com/rollup/rollup) is a js bundler simliar to Browserify and Webpack, but it does less magic. That's important, because Zapier expects a variable called `Zap` that has some specifically named functions on it. Also, you can't use any node imports besides a couple of [pre-defined](https://zapier.com/developer/documentation/v2/scripting/#available-libraries) modules.

You can check out `compile.sh` for the full dish, but the meat of the matter is this:

```javascript
const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

// build bundle
rollup
  .rollup({
    entry: 'zapier.js',
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  })
  .then(bundle => bundle.write({
    dest: 'bundle.js',
    format: 'cjs'
  }))
```

There's definitely still some magic happening, but all the module code is in one file and Zapier seems to be cool with that. Now you can create more complicated Zapier code too!

### ENV Values

If I wanted to open source my app, I had to make sure not to reveal my OAuth consumer credentials (which were needed at runtime to make authenticated requests against Splitwise). The other piece of the compile script adds them into the bundle (which you'll notice is not included in the source). So, that's an option for secret things as well.
