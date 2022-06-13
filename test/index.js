const tap = require('tap')
const Fastify = require('fastify')
const proxyquire = require('proxyquire')

const kubernetes = proxyquire('../fastify-kubernetes.js', {
  '@kubernetes/client-node': process.env.K8S_CONFIG ? {} : require('./mock')
})

function register (t, options, callback) {
  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(kubernetes, options)
    .ready(err => callback(err, fastify))
}

function testDecorator (t, decorator) {
  t.ok(decorator)
  t.equal(decorator.context, 'minikube')
  t.equal(decorator.cluster, 'minikube')
  t.equal(decorator.user, 'minikube')
  t.equal(decorator.namespace, 'default')
  t.ok(decorator.api)
  t.ok(decorator.api.CoreV1Api)
}

tap.test('smoke', t => {
  t.plan(1 + 7 + 1)

  register(t, { file: process.env.K8S_CONFIG }, (err, fastify) => {
    t.error(err)
    testDecorator(t, fastify.kubernetes)

    const client = fastify.kubernetes.api.CoreV1Api
    client.listNamespacedPod(fastify.kubernetes.namespace)
      .catch(t.error)
      .then(result => t.ok(Array.isArray(result.body.items)))
  })
})

tap.test('named', t => {
  t.plan(1 + 7 + 7 + 1)

  register(t, { file: process.env.K8S_CONFIG, name: 'minikube' }, (err, fastify) => {
    t.error(err)
    testDecorator(t, fastify.kubernetes)
    testDecorator(t, fastify.kubernetes.minikube)

    const client = fastify.kubernetes.minikube.api.CoreV1Api
    client.listNamespacedPod(fastify.kubernetes.namespace)
      .catch(t.error)
      .then(result => t.equal(Array.isArray(result.body.items), true))
  })
})

tap.test('default-collision', t => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(kubernetes, { file: '/a.kube.config' })
  fastify.register(kubernetes, { file: '/b.kube.config' })

  fastify.ready(err => {
    t.ok(err)
    t.equal(err.message, 'fastify-kubernetes has already registered')
  })
})

tap.test('named-collision', t => {
  t.plan(2)

  const fastify = Fastify()
  t.teardown(() => fastify.close())

  fastify.register(kubernetes, { name: 'collision', file: '/a.kube.config' })
  fastify.register(kubernetes, { name: 'collision', file: '/b.kube.config' })

  fastify.ready(err => {
    t.ok(err)
    t.equal(err.message, 'Kubernetes context "collision" already registered')
  })
})

tap.test('context-not-found', t => {
  t.plan(2)

  register(t, { file: process.env.K8S_CONFIG, context: 'nope' }, (err, fastify) => {
    t.ok(err)
    t.equal(err.message, 'Kubernetes context not found')
  })
})
