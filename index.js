'use strict'

const makePlugin = require('fastify-plugin')
const { KubeConfig } = require('@kubernetes/client-node')

function fastifyKubernetes (fastify, options, callback) {
  const clusterName = options.cluster || 'minikube'
  const namespace = options.namespace || 'default'

  const config = new KubeConfig()

  try {
    if (options.file) {
      config.loadFromFile(options.file)
    } else {
      config.loadFromDefault()
    }
  } catch (err) {
    return callback(err)
  }

  const cluster = config.getCurrentCluster()
  if (!cluster) {
    return callback(new Error('No clusters'))
  }
  if (cluster.name !== clusterName) {
    return callback(new Error('Unexpected cluster'))
  }

  fastify.decorate('kubernetes', { config, namespace })

  callback()
}

module.exports = makePlugin(fastifyKubernetes, {
  fastify: '^2.0.0',
  name: 'fastify-kubernetes'
})
