const { test } = require('tap')
const fastify = require('fastify')
const proxyquire = require('proxyquire')

const kubernetes = proxyquire('../fastify-kubernetes.js', {
  '@kubernetes/client-node': process.env.K8S_CONFIG ? {} : require('./mock')
})

function testDecorator (tap, decorator) {
  const { context, cluster, user, namespace } = decorator

  tap.equal(context, 'minikube')
  tap.equal(cluster, 'minikube')
  tap.equal(user, 'minikube')
  tap.equal(namespace, 'default')
}

test('simple', tap => {
  const app = fastify()

  app
    .register(kubernetes, { file: process.env.K8S_CONFIG })
    .ready(err => {
      tap.error(err)

      testDecorator(tap, app.kubernetes)

      const client = app.kubernetes.api.CoreV1Api

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

test('nested', tap => {
  const app = fastify()

  app
    .register(kubernetes, {
      file: process.env.K8S_CONFIG,
      name: 'minikube'
    })
    .ready(err => {
      tap.error(err)

      testDecorator(tap, app.kubernetes)
      testDecorator(tap, app.kubernetes.minikube)

      const client = app.kubernetes.minikube.api.CoreV1Api

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
