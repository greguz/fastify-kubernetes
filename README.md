# fastify-kubernetes

[![npm version](https://badge.fury.io/js/fastify-kubernetes.svg)](https://badge.fury.io/js/fastify-kubernetes) [![Dependencies Status](https://david-dm.org/greguz/fastify-kubernetes.svg)](https://david-dm.org/greguz/fastify-kubernetes.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify Kubernetes client plugin.

This plugin uses the [official Node.js Kubernetes client](https://www.npmjs.com/package/@kubernetes/client-node) under the hood.

## Install

```
npm install --save @kubernetes/client-node fastify-kubernetes
```

You need to install both this plugin and the kubernetes client, because the client is saved as a [peer depencency](https://nodejs.org/en/blog/npm/peer-dependencies/).

## Usage

Add it to your project with `register` and you are done!

```javascript
const { Core_v1Api } = require("@kubernetes/client-node")
const fastify = require('fastify')()

fastify.register(require('fastify-kubernetes'), {
  // Optional, defaults to OS default Kubeconfig file location
  file: "/home/app/.kube/config",
  // Context to use
  context: "production"
})

fastify.get('/pods', async function (req, reply) {
  const client = this.kubernetes.makeClient(Core_v1Api)
  const result = await client.listNamespacedPod(this.kubernetes.namespace);
  reply.send(result.body.items)
})

fastify.listen(3000, err => {
  if (err) throw err
})
```
