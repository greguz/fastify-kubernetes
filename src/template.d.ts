import { FastifyPluginCallback } from 'fastify'
import * as kubernetes from '@kubernetes/client-node'

declare namespace fastifyKubernetes {
  interface FastifyKubernetesOptions {
    /**
     * Kubeconfig file path. If both `file` and `yaml` options are not provided, will be used the default OS's kubeconfig file.
     */
    file?: string
    /**
     * Kubeconfig file content. If both `file` and `yaml` options are not provided, will be used the default OS's kubeconfig file.
     */
    yaml?: string | Buffer
    /**
     * Context to use, default to 'minikube'
     */
    context?: string
    /**
     * If specified, the context's cluster is verified
     */
    cluster?: string
    /**
     * If specified, the context's user is verified
     */
    user?: string
    /**
     * If specified, the context's namespace is verified
     */
    namespace?: string
    /**
     * Nested config name
     */
    name?: string
  }
  interface FastifyKubernetesObject {
    /**
     * Kubernetes config instance
     */
    config: kubernetes.KubeConfig
    /**
     * Current context
     */
    context: string
    /**
     * Current cluster
     */
    cluster: string
    /**
     * Current user
     */
    user: string
    /**
     * Current namespace
     */
    namespace: string
    /**
     * Client instances collection
     */
    api: {
/** AUTOMATION REQUIRED **/
      [key: string]: any
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    kubernetes: fastifyKubernetes.FastifyKubernetesObject & {
      [name: string]: fastifyKubernetes.FastifyKubernetesObject
    }
  }
}

declare let fastifyKubernetes: FastifyPluginCallback<
  fastifyKubernetes.FastifyKubernetesOptions
>

export = fastifyKubernetes
