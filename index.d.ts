import * as http from "http"
import * as fastify from "fastify"
import { ApiConstructor, ApiType, KubeConfig } from "@kubernetes/client-node"

declare namespace fastifyKubernetes {
  interface FastifyKubernetesOptions {
    /**
     * Kube config file location, default to OS default location
     */
    file?: string
    /**
     * Context to use, default to "minikube"
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
    config: KubeConfig
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
     * Shortcut for config.makeApiClient()
     */
    makeClient: <T extends ApiType>(Client: ApiConstructor<T>) => T
  }
}

declare module "fastify" {
  interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    kubernetes: fastifyKubernetes.FastifyKubernetesObject & {
      [name: string]: fastifyKubernetes.FastifyKubernetesObject
    }
  }
}

declare let fastifyKubernetes: fastify.Plugin<
  http.Server,
  http.IncomingMessage,
  http.ServerResponse,
  fastifyKubernetes.FastifyKubernetesOptions
>

export = fastifyKubernetes
