#! /usr/local/bin/node

require('dotenv').config()

const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const replace = require('replace-in-file')

// build bundle
rollup.rollup({
  entry: 'zapier.js',
  plugins: [
    nodeResolve(),
    commonjs()
  ]
}).then(bundle => bundle.write({
  dest: 'bundle.js',
  format: 'cjs'
})).then(() => {
  // inject key/secret
  try {
    replace.sync(replaceConfig(oauthString('public')))
    replace.sync(replaceConfig(oauthString('secret')))
  } catch (error) {
    Promise.reject(error)
  }
}).catch(err => console.log(err.stack))

// helpers
function replaceConfig (key) {
  return {
    files: './bundle.js',
    replace: `<${key}>`,
    with: process.env[key]
  }
}

function oauthString (key) {
  return `OAUTH_CONSUMER_${key.toUpperCase()}`
}
