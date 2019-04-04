# fastify-kubernetes

[![npm version](https://badge.fury.io/js/fastify-kubernetes.svg)](https://badge.fury.io/js/fastify-kubernetes) [![Dependencies Status](https://david-dm.org/greguz/fastify-kubernetes.svg)](https://david-dm.org/greguz/fastify-kubernetes.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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
  file: "/home/app/.kube/config",
  // Optional, default to "minkube"
  cluster: "production",
  // Optional, default to "default"
  namespace: "default"
})

fastify.get('/clusters', function (req, reply) {
  const { config } = this.kubernetes
  const clusters = config.getClusters()
  reply.send(clusters)
})

fastify.listen(3000, err => {
  if (err) throw err
})
```

The `cluster` existence is verified on server start.

The `namespace` is just a saved string, no checks are performed.
