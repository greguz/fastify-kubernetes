# fastify-kubernetes

[![npm version](https://badge.fury.io/js/fastify-kubernetes.svg)](https://badge.fury.io/js/fastify-kubernetes) [![Dependencies Status](https://david-dm.org/greguz/fastify-kubernetes.svg)](https://david-dm.org/greguz/fastify-kubernetes.svg) [![Build Status](https://travis-ci.com/greguz/fastify-kubernetes.svg?branch=master)](https://travis-ci.com/greguz/fastify-kubernetes) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify Kubernetes client plugin.

This plugin uses the [official Node.js Kubernetes client](https://www.npmjs.com/package/@kubernetes/client-node) under the hood. The current bundled version  is `v0.8.2`.

## Install

```
npm install --save fastify-kubernetes
```

## Usage

Add it to your project with `register` and you are done!

```javascript
const fastify = require('fastify')()

fastify.register(require('fastify-kubernetes'), {
  // Optional, defaults to OS default Kubeconfig file location
  file: "/home/app/.kube/config",
  // Context to use
  context: "production"
})

fastify.get('/pods', async function (req, reply) {
  const client = this.kubernetes.api.Core_v1Api
  const result = await client.listNamespacedPod(this.kubernetes.namespace);
  reply.send(result.body.items)
})

fastify.listen(3000, err => {
  if (err) throw err
})
```

## Reference

The plugin will inject six properties under `kubernetes` decorator.

### config

KubeConfig class instance.

### context

Current context name.

### cluster

Current context's cluster.

### user

Current context's user.

### namespace

Current context's namespace, defaults to `"default"`.

### api

Object containing all possible client instances. You can retrieve a client by its name from the kubernetes client lib.

```javascript
this.kubernetes.api.Core_v1Api
this.kubernetes.api.Batch_v1Api
this.kubernetes.api.Batch_v1beta1Api
```
