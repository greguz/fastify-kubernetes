'use strict'

const kubernetes = require('@kubernetes/client-node')
const makePlugin = require('fastify-plugin')

function getContext (config, options) {
  const contextName = options.context || 'minikube'
  const namespace = options.namespace || 'default'

  return config.getContexts().find(context => {
    if (context.name !== contextName) {
      return false
    }
    if (options.cluster && context.cluster !== options.cluster) {
      return false
    }
    if (options.user && context.user !== options.user) {
      return false
    }
    if ((context.namespace || 'default') !== namespace) {
      return false
    }
    return true
  })
}

function buildGetter (config, Client) {
  return function getter () {
    let client
    if (!client) {
      client = config.makeApiClient(Client)
    }
    return client
  }
}

function buildApi (config) {
  const api = {}

  for (const key of Object.keys(kubernetes)) {
    const obj = kubernetes[key]

    if (obj && obj.prototype && obj.prototype.setDefaultAuthentication) {
      Object.defineProperty(api, key, {
        enumerable: true,
        get: buildGetter(config, obj)
      })
    }
  }

  return api
}

function fastifyKubernetes (fastify, options, callback) {
  const config = new kubernetes.KubeConfig()
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
    api: buildApi(config)
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
  fastify: '^3.0.0',
  name: 'fastify-kubernetes'
})
