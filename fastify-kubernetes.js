import * as kubernetes from '@kubernetes/client-node'
import plugin from 'fastify-plugin'

function getContext (config, { cluster, context, namespace, user }) {
  return config.getContexts().find(obj => {
    if (context && obj.name !== context) {
      return false
    }
    if (cluster && obj.cluster !== cluster) {
      return false
    }
    if (user && obj.user !== user) {
      return false
    }
    if (namespace && (obj.namespace || 'default') !== namespace) {
      return false
    }
    return true
  })
}

/**
 * This function will creates the client instance and cache it.
 * This is done because I have no idea if the `SomethingV42Api` is a valid KubeConfig Api constructor.
 */
function buildGetter (config, Client) {
  let client
  return function getter () {
    if (!client) {
      client = config.makeApiClient(Client)
    }
    return client
  }
}

function buildApi (config) {
  const api = {}

  for (const key of Object.keys(kubernetes)) {
    if (/.Api$/.test(key)) {
      Object.defineProperty(api, key, {
        configurable: true,
        enumerable: true,
        get: buildGetter(config, kubernetes[key])
      })
    }
  }

  return api
}

function loadConfig (options) {
  // Handle (and verify) custom KubeConfig instance
  if (typeof options.kubeconfig === 'object') {
    if (!(options.kubeconfig instanceof kubernetes.KubeConfig)) {
      throw new TypeError('KubeConfig loading error: unexpected KubeConfig instance type')
    }
    return options.kubeconfig
  }

  // Validate selected KubeConfig loading mode
  const mode = options.kubeconfig || 'auto'
  if (
    mode !== 'auto' &&
    mode !== 'default' &&
    mode !== 'file' &&
    mode !== 'in-cluster' &&
    mode !== 'yaml'
  ) {
    throw new TypeError('KubeConfig loading error: unknown loading mode')
  }

  const config = new kubernetes.KubeConfig()

  if (mode === 'file' || (mode === 'auto' && options.file)) {
    if (typeof options.file !== 'string') {
      throw new TypeError('KubeConfig loading error: option "file" is not a string')
    }
    config.loadFromFile(options.file)
  } else if (mode === 'yaml' || (mode === 'auto' && options.yaml)) {
    if (typeof options.yaml !== 'string' && !Buffer.isBuffer(options.yaml)) {
      throw new TypeError('KubeConfig loading error: option "yaml" is not a string or buffer')
    }
    config.loadFromString(options.yaml.toString())
  } else if (mode === 'in-cluster' || process.env.KUBERNETES_SERVICE_HOST) {
    config.loadFromCluster()
  } else {
    config.loadFromDefault()
  }

  return config
}

async function fastifyKubernetesPlugin (fastify, options) {
  const config = loadConfig(options)

  const context = getContext(config, options)
  if (!context) {
    throw new Error('KubeConfig loading error: unable to find a matching context')
  }

  config.setCurrentContext(context.name)

  const key = options.name
  const obj = {
    config,
    context: context.name,
    cluster: context.cluster,
    user: context.user,
    namespace: context.namespace || 'default',
    api: buildApi(config)
  }

  if (!key) {
    if (fastify.kubernetes) {
      throw new Error('fastify-kubernetes has already registered')
    }
    fastify.decorate('kubernetes', obj)
  } else {
    if (fastify.kubernetes === undefined) {
      fastify.decorate('kubernetes', obj)
    }
    if (fastify.kubernetes[key] !== undefined) {
      throw new Error(`Kubernetes context ${key} already registered`)
    }
    fastify.kubernetes[key] = obj
  }
}

export default plugin(fastifyKubernetesPlugin, {
  fastify: '^5.x',
  name: 'fastify-kubernetes'
})
