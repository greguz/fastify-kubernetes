# fastify-kubernetes

[![npm version](https://badge.fury.io/js/fastify-kubernetes.svg)](https://badge.fury.io/js/fastify-kubernetes)
[![Dependencies Status](https://david-dm.org/greguz/fastify-kubernetes.svg)](https://david-dm.org/greguz/fastify-kubernetes.svg)
![ci](https://github.com/greguz/fastify-kubernetes/workflows/ci/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify Kubernetes client plugin.

This plugin uses the [official Node.js Kubernetes client](https://www.npmjs.com/package/@kubernetes/client-node) under the hood.

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
  file: '/home/app/.kube/config',
  // Context to use
  context: 'production'
})

fastify.get('/pods', async function (req, reply) {
  const client = this.kubernetes.api.CoreV1Api
  const result = await client.listNamespacedPod(this.kubernetes.namespace)
  reply.send(result.body.items)
})

fastify.listen(3000, err => {
  if (err) throw err
})
```

## Options

All properties are optional.

- `file` is the *kube config* file location
- `context` is the context to use, defaults to `"minikube"`
- `cluster` if provided, this plugin ensures that is the cluster used by the current context
- `user` if provided, this plugin ensures that is the user used by the current context
- `namespace` if provided, this plugin ensures that is the namespace used by the current context

A `name` option can be used in order to connect to multiple kubernetes clusters.

```javascript
const fastify = require('fastify')()

fastify
  .register(require('fastify-kubernetes'), {
    context: 'eu-cluster-0',
    name: 'eu'
  })
  .register(require('fastify-kubernetes'), {
    context: 'us-cluster-0',
    name: 'us'
  })

fastify.get('/', async function (req, reply) {
  const euClient = this.kubernetes.eu.api.CoreV1Api
  const usClient = this.kubernetes.us.api.CoreV1Api
  // ------------
  // do your stuff here
  // ------------
  reply.send(yourResult)
})
```

## Reference

The plugin will inject six properties under `kubernetes` decorator.

- `config` is the *KubeConfig* instance
- `context` is the current context name
- `cluster` is the context's cluster
- `user` is the context's user
- `namespace` is the context's namespace, defaults to `"default"`
- `api` is an object containing all possible client types

### API

You can retrieve a client by its original name from the kubernetes lib.

```javascript
const client0 = this.kubernetes.api.CoreV1Api
const client1 = this.kubernetes.api.BatchV1Api
const client2 = this.kubernetes.api.BatchV1beta1Api
```
