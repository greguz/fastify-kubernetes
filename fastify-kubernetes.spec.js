import tap from 'tap'
import Fastify from 'fastify'

tap.test('defaults', async t => {
  t.plan(8)

  class CoreV1Api {
    listNamespacedPod (param) {
      t.match(param, { namespace: 'default' })
      return Promise.resolve([])
    }
  }

  class KubeConfig {
    getContexts () {
      t.pass()
      return [
        {
          cluster: 'tap',
          name: 'tap',
          user: 'tap'
        }
      ]
    }

    loadFromDefault () {
      t.pass()
    }

    makeApiClient (Api) {
      t.ok(Api === CoreV1Api)
      return new Api(this)
    }

    setCurrentContext (name) {
      t.equal(name, 'tap')
    }
  }

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {
      CoreV1Api,
      KubeConfig
    }
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  await fastify.register(plugin)
  t.match(fastify.kubernetes, {
    cluster: 'tap',
    context: 'tap',
    namespace: 'default',
    user: 'tap'
  })

  const coreApi = fastify.kubernetes.api.CoreV1Api

  // Test client instance caching
  t.ok(coreApi === fastify.kubernetes.api.CoreV1Api)

  const pods = await coreApi.listNamespacedPod({ namespace: fastify.kubernetes.namespace })

  t.ok(Array.isArray(pods))
})

tap.test('plugin collision', async t => {
  t.plan(8)

  class KubeConfig {
    getContexts () {
      t.pass()
      return [
        {
          cluster: 'tap',
          name: 'tap',
          user: 'tap'
        }
      ]
    }

    loadFromDefault () {
      t.pass()
    }

    setCurrentContext (name) {
      t.equal(name, 'tap')
    }
  }

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {
      KubeConfig
    }
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(plugin)
  fastify.register(plugin)

  const err = await t.rejects(fastify.ready())
  t.match(err, { message: 'fastify-kubernetes has already registered' })
})

tap.test('custom kubeconfig instance', async t => {
  t.plan(2)

  class KubeConfig {
    getContexts () {
      t.pass()
      return [
        {
          cluster: 'tap',
          name: 'tap',
          user: 'tap'
        }
      ]
    }

    setCurrentContext (name) {
      t.equal(name, 'tap')
    }
  }

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {
      KubeConfig
    }
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(plugin, {
    kubeconfig: new KubeConfig()
  })

  await fastify.ready()
})

tap.test('unknown kubeconfig instance', async t => {
  t.plan(2)

  class KubeConfig { }

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {
      KubeConfig
    }
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(plugin, {
    kubeconfig: {}
  })

  const err = await t.rejects(fastify.ready())
  t.match(err, { message: 'KubeConfig loading error: unexpected KubeConfig instance type' })
})

tap.test('context not found', async t => {
  t.plan(4)

  class KubeConfig {
    loadFromDefault () {
      t.pass()
    }

    getContexts () {
      t.pass()
      return [
        {
          cluster: 'tap',
          name: 'tap',
          user: 'tap'
        }
      ]
    }
  }

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {
      KubeConfig
    }
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(plugin, { context: 'minikube' })

  const err = await t.rejects(fastify.ready())
  t.match(err, { message: 'KubeConfig loading error: unable to find a matching context' })
})

tap.test('nested key', async t => {
  t.plan(6)

  class KubeConfig {
    loadFromDefault () {
      t.pass()
    }

    getContexts () {
      t.pass()
      return [
        {
          cluster: 'tap',
          name: 'tap',
          user: 'tap'
        }
      ]
    }

    setCurrentContext (name) {
      t.equal(name, 'tap')
    }
  }

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {
      KubeConfig
    }
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(plugin, { name: 'nested' })

  await fastify.ready()
  t.ok(fastify.kubernetes)
  t.ok(fastify.kubernetes.nested)
  t.ok(fastify.kubernetes === fastify.kubernetes.nested)
})

tap.test('unknown kubeconfig mode', async t => {
  t.plan(2)

  const plugin = await t.mockImport('./fastify-kubernetes.js', {
    '@kubernetes/client-node': {}
  })

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(plugin, { kubeconfig: 'nope' })

  const err = await t.rejects(fastify.ready())
  t.match(err, { message: 'KubeConfig loading error: unknown loading mode' })
})
