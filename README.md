# fastify-kubernetes

[![npm version](https://badge.fury.io/js/fastify-kubernetes.svg)](https://badge.fury.io/js/fastify-kubernetes)
[![Dependencies Status](https://david-dm.org/greguz/fastify-kubernetes.svg)](https://david-dm.org/greguz/fastify-kubernetes.svg)
![ci](https://github.com/greguz/fastify-kubernetes/workflows/ci/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify Kubernetes client plugin.

This plugin uses the [official Node.js Kubernetes client](https://www.npmjs.com/package/@kubernetes/client-node) under the hood.

## Compatibility

The installed version of `@kubernetes/client-node` is the `v1.x.x`.
The targeted Kubernetes version is from the `v1.28` to `v1.30`.

For more info about supported Kubernetes version see [here](https://github.com/kubernetes-client/javascript#compatibility).

> Generally speaking newer clients will work with older Kubernetes, but compatability isn't 100% guaranteed.

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

### ESM - CommonJS Interoperability

This module is now pure [ESM](https://nodejs.org/api/esm.html). This is to use the same module system of the `@kubernetes/client-node` (as from v1.0.0).

This shouldn't be a problem with Node.js v22.13.0 or newer.

If you are seeing an error like this one:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module node_modules/fastify-kubernetes/fastify-kubernetes.js from my_script.js not supported.
Instead change the require of fastify-kubernetes.js in my_script.js to a dynamic import() which is available in all CommonJS modules.
    at Object.<anonymous> (my_script.js:2:20) {
  code: 'ERR_REQUIRE_ESM'
}
```

You have multimple options to solve the problem:

- Upgrade you Node.js version to >=22.13.0
- Use `await import('fastify-kubernetes')` instead of `require('fastify-kubernetes')`
- Convert your project to use ESM instead of CommonJS

## Options

All properties are optional.

- `kubeconfig`: Kubernetes config file loading mode. Default is `"auto"`.
  - `KubeConfig`: Load custom `KubeConfig` instance (see `@kubernetes/client-node` docs).
  - `"auto"`: Choose the first available mode in this order: Choose the first available config mode in this order: `"file"`, `"yaml"`, `"in-cluster"`, and `"default"`.
  - `"file"`: Load config file from `file` option.
  - `"yaml"`: Load config from `yaml` option.
  - `"in-cluster"`: Load in-cluster kubeconfig file.
  - `"default"`: Load config file the default OS location.
- `file`: `kubeconfig` (YAML format) file path.
- `yaml`: Raw `kubeconfig` yaml data (string of Node.js `Buffer`).
- `context`: Loads Context by name.
- `cluster`: Loads Context by Curster's name.
- `user`: Loads Context by User's name.
- `namespace`: Loads Context by Namespace.
- `name`: Nested (Fastify) decorator name (will inject `fastify.kubernetes[key]`).

```javascript
import Fastify from 'fastify'

const fastify = Fastify()

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

// TODO: start server, etc..
```

## Reference

The plugin will inject six properties under `kubernetes` decorator.

- `config` is the `KubeConfig` instance.
- `context` is the current Context's name.
- `cluster` is the Cluster's name.
- `user` is the User's name.
- `namespace` is the Namespace, defaults to `"default"`.
- `api` is an object containing all known client instances (see below).

### Known API Clients

You can retrieve a client by its original name from the kubernetes lib.

```javascript
import kubernetes from 'fastify-kubernetes'

const fastify = Fastify()

fastify.register(kubernetes)

// Load plugins (http server not running)
await fastify.ready()

const client0 = fastify.kubernetes.api.CoreV1Api
const client1 = fastify.kubernetes.api.BatchV1Api
const client2 = fastify.kubernetes.api.BatchV1beta1Api
```

### Foreign API Clients

You can also manually creates Api clients.

```javascript 
import { BatchV1Api } from '@kubernetes/client-node'
import kubernetes from 'fastify-kubernetes'

const fastify = Fastify()

fastify.register(kubernetes)

// Load plugins (http server not running)
await fastify.ready()

const batchApi = fastify.kubernetes.config.makeApiClient(BatchV1Api)

const cronJobs = await batchApi.listNamespacedCronJob({ namespace: fastify.kubernetes.namespace })
```
