'use strict'

const kubernetes = require('@kubernetes/client-node')
const plugin = require('fastify-plugin')

function getContext (config, options) {
  const namespace = options.namespace || 'default'

  return config.getContexts().find(context => {
    if (options.context && context.name !== options.context) {
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
        configurable: true,
        enumerable: true,
        get: buildGetter(config, obj)
      })
    }
  }

  return api
}

function loadFromFile (file) {
  if (typeof file !== 'string') {
    throw new Error('Cannot load kubeconfig: option "file" is not a string')
  }
  const config = new kubernetes.KubeConfig()
  config.loadFromFile(file)
  return config
}

function loadFromString (yaml) {
  if (typeof yaml !== 'string' && !Buffer.isBuffer(yaml)) {
    throw new Error('Cannot load kubeconfig: option "yaml" is not a string or buffer')
  }
  const config = new kubernetes.KubeConfig()
  config.loadFromString(yaml.toString())
  return config
}

function loadFromCluster () {
  const config = new kubernetes.KubeConfig()
  config.loadFromCluster()
  return config
}

function loadFromDefault () {
  const config = new kubernetes.KubeConfig()
  config.loadFromDefault()
  return config
}

function loadConfig (options) {
  // Explicit target
  if (typeof options.kubeconfig === 'object' && options.kubeconfig !== null) {
    return options.kubeconfig
  } else if (options.kubeconfig === 'file') {
    return loadFromFile(options.file)
  } else if (options.kubeconfig === 'yaml') {
    return loadFromString(options.yaml)
  } else if (options.kubeconfig === 'default') {
    return loadFromDefault()
  } else if (options.kubeconfig === 'in-cluster') {
    return loadFromCluster()
  }

  // Auto mode
  if (options.file) {
    return loadFromFile(options.file)
  } else if (options.yaml) {
    return loadFromString(options.yaml)
  } else if (process.env.KUBERNETES_SERVICE_HOST) {
    return loadFromCluster()
  } else {
    return loadFromDefault()
  }
}

async function fastifyKubernetesPlugin (fastify, options) {
  const config = loadConfig(options)

  const context = getContext(config, options)
  if (!context) {
    return Promise.reject(new Error('Kubernetes context not found'))
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
      return Promise.reject(new Error('fastify-kubernetes has already registered'))
    }
    fastify.decorate('kubernetes', obj)
  } else {
    if (!fastify.kubernetes) {
      fastify.decorate('kubernetes', obj)
    }
    if (fastify.kubernetes[name]) {
      return Promise.reject(new Error(`Kubernetes context "${name}" already registered`))
    }
    fastify.kubernetes[name] = obj
  }
}

module.exports = plugin(fastifyKubernetesPlugin, {
  fastify: '^4.0.0',
  name: 'fastify-kubernetes'
})
