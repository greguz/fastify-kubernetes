class FakeClient {
  listNamespacedPod () {
    return Promise.resolve({
      body: {
        items: []
      }
    })
  }
}

class KubeConfig {
  loadFromDefault () { }
  setCurrentContext () { }
  getContexts () {
    return [{
      name: 'minikube',
      cluster: 'minikube',
      user: 'minikube'
    }]
  }
  makeApiClient () {
    return new FakeClient()
  }
}

module.exports = { KubeConfig }
