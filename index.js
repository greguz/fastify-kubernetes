'use strict'

const makePlugin = require('fastify-plugin')
const { KubeConfig } = require('@kubernetes/client-node')

function getContext (config, options) {
  const name = options.context || 'minikube'
  const contexts = config.getContexts()

  return contexts.find(context => {
    if (context.name !== name) {
      return false
    }

    if (options.cluster && context.cluster !== options.cluster) {
      return false
    }
    if (options.user && context.user !== options.user) {
      return false
    }
    if ((context.namespace || 'default') !== (options.namespace || 'default')) {
      return false
    }

    return true
  })
}

function fastifyKubernetes (fastify, options, callback) {
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

  const context = getContext(config, options)
  if (!context) {
    callback(new Error('Context not found'))
    return
  }

  config.setCurrentContext(context.name)

  const name = options.name
  const obj = {
    config,
    context: context.name,
    cluster: context.cluster,
    user: context.user,
    namespace: context.namespace || 'default',
    makeClient: config.makeApiClient.bind(config)
  }

  if (!name) {
    if (fastify.kubernetes) {
      callback(new Error('Plugin fastify-kubernetes has already registered'))
      return
    }
    fastify.decorate('kubernetes', obj)
  } else {
    if (!fastify.kubernetes) {
      fastify.decorate('kubernetes', obj)
    }
    if (fastify.kubernetes[name]) {
      callback(new Error('Duplicated registration'))
      return
    }
    fastify.kubernetes[name] = obj
  }

  callback()
}

module.exports = makePlugin(fastifyKubernetes, {
  fastify: '^2.0.0',
  name: 'fastify-kubernetes'
})
