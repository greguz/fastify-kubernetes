const { test } = require('tap')
const fastify = require('fastify')
const kubernetes = require('./index')
const { Core_v1Api, KubeConfig } = require('@kubernetes/client-node') // eslint-disable-line

function testDecorator (tap, decorator) {
  const { config, context, cluster, user, namespace } = decorator

  tap.equal(config instanceof KubeConfig, true)
  tap.equal(context, 'minikube')
  tap.equal(cluster, 'minikube')
  tap.equal(user, 'minikube')
  tap.equal(namespace, 'default')
}

test('test', tap => {
  const app = fastify()

  app
    .register(kubernetes)
    .ready(err => {
      tap.error(err)

      testDecorator(tap, app.kubernetes)

      const client = app.kubernetes.makeClient(Core_v1Api)

      client.listNamespacedPod(app.kubernetes.namespace)
        .catch(tap.error)
        .then(result => tap.equal(Array.isArray(result.body.items), true))
        .then(() => {
          app.close(() => {
            tap.end()
          })
        })
    })
})

test('test', tap => {
  const app = fastify()

  app
    .register(kubernetes, { name: 'minikube' })
    .ready(err => {
      tap.error(err)

      testDecorator(tap, app.kubernetes.minikube)

      const client = app.kubernetes.minikube.makeClient(Core_v1Api)

      client.listNamespacedPod(app.kubernetes.namespace)
        .catch(tap.error)
        .then(result => tap.equal(Array.isArray(result.body.items), true))
        .then(() => {
          app.close(() => {
            tap.end()
          })
        })
    })
})
