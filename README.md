# NOTE

this is deprecated in favor of the official integration: https://zapier.com/apps/splitwise/integrations

# zapier-splitwise

A [Zapier](https://zapier.com) app that gives access to the [Splitwise API](http://dev.splitwise.com/). This versions is built for Zapier platform 2.

## Using the App

The app is available to everyone when creating a zap! Select it like you would any other.

It'll prompt you to create a Zapier account if you don't already have one. Feel free open an [issue](https://github.com/xavdid/zapier-splitwise/issues) or email contact@zapier.com if you run into a bug or have feedback for how the app works.

## Current Features

See the zapbook page for more info: https://zapier.com/zapbook/splitwise/

## Making Your Own

The most powerful part of Zapier is that they allow you to create your own apps (for both public and private use). While I was making this app, I hit some development corner cases, so I've collected some of the solutions here.

In the current state of the world, it's tricky to use node modules within zapier apps. There's also no concept of environment variables. Depending on your task, this matters either a lot or a little and in the case of Splitwise (and their OAuth 1.0 authentication), it's a pain in the butt. Luckily, it's fixable.

### Bundles

**NOTE**: This was made before the release of Zapier's [Platform CLI](https://github.com/zapier/zapier-platform-cli), which largely removes the need for this workaround. If you're able, I suggest using the CLI. If you're unable, this will stay here as reference (though the behavior isn't officially supported).

[Rollup](https://github.com/rollup/rollup) is a javascript bundler similar to Browserify and Webpack, but it does less magic. That's important, because Zapier expects a variable called `Zap` that has some specifically named functions on it. Also, you can't use any node imports besides a couple of [pre-defined](https://zapier.com/developer/documentation/v2/scripting/#available-libraries) modules.

You can check out `compile` for the full dish, but the meat of the matter is this:

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
