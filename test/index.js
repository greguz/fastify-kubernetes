const tap = require('tap')
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

tap.test('simple', t => {
  const app = fastify()

  app
    .register(kubernetes, { file: process.env.K8S_CONFIG })
    .ready(err => {
      t.error(err)

      testDecorator(t, app.kubernetes)

      const client = app.kubernetes.api.CoreV1Api

      client.listNamespacedPod(app.kubernetes.namespace)
        .catch(t.error)
        .then(result => t.equal(Array.isArray(result.body.items), true))
        .then(() => {
          app.close(() => {
            t.end()
          })
        })
    })
})

tap.test('nested', t => {
  const app = fastify()

  app
    .register(kubernetes, {
      file: process.env.K8S_CONFIG,
      name: 'minikube'
    })
    .ready(err => {
      t.error(err)

      testDecorator(t, app.kubernetes)
      testDecorator(t, app.kubernetes.minikube)

      const client = app.kubernetes.minikube.api.CoreV1Api

      client.listNamespacedPod(app.kubernetes.namespace)
        .catch(t.error)
        .then(result => t.equal(Array.isArray(result.body.items), true))
        .then(() => {
          app.close(() => {
            t.end()
          })
        })
    })
})
