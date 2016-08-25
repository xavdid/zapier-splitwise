#! /usr/local/bin/node

require('dotenv').config()

const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const replace = require('replace-in-file')

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
  // don't need to get result of previous action
  .then(() => replace(genConfig(oauthString('public'))))
  .then(() => replace(genConfig(oauthString('secret'))))
  // zapier can't handle const yet
  .then(() => replace({
    files: './bundle.js',
    replace: /const /g,
    with: 'var '
  }))
  .catch(err => console.log(err.stack))

// helpers
function genConfig (key) {
  return {
    files: './bundle.js',
    replace: `<${key}>`,
    with: process.env[key]
  }
}

function oauthString (key) {
  return `OAUTH_CONSUMER_${key.toUpperCase()}`
}
