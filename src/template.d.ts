import type { FastifyPluginAsync } from 'fastify'
import type * as kubernetes from '@kubernetes/client-node'

/**
 * Plugin options for `fastify-kubernetes` plugin.
 */
export interface FastifyKubernetesOptions {
  /**
   * Kubeconfig loading mode:
   * - `"auto"`: Choose the first available config mode in this order: `"file"`, `"yaml"`, `"in-cluster"`, and `"default"`.
   * - `"default"`: Load config file the default OS location.
   * - `"file"`: Load config file from `file` option.
   * - `"in-cluster"`: Load in-cluster kubeconfig file.
   * - `"yaml"`: Load config from `yaml` option.
   * - `KubeConfig`: Load custom `KubeConfig` instance.
   *
   * @default "auto"
   */
  kubeconfig?:
    | 'auto'
    | 'default'
    | 'file'
    | 'in-cluster'
    | 'yaml'
    | kubernetes.KubeConfig
  /**
   * Kubeconfig file path.
   */
  file?: string
  /**
   * Kubeconfig YAML string (or buffer) content.
   */
  yaml?: string | Buffer
  /**
   * Loads KubeConfig context by name.
   */
  context?: string
  /**
   * Loads KubeConfig context by cluster's name.
   */
  cluster?: string
  /**
   * Loads KubeConfig context by user's name.
   */
  user?: string
  /**
   * Loads KubeConfig context by namespace.
   */
  namespace?: string
  /**
   * Nested (will inject `fastify.kubernetes[name]`) decorator name.
   */
  name?: string
}

export interface FastifyKubernetesDecorator {
  /**
   * Current `KubeConfig` instance.
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

declare module 'fastify' {
  interface FastifyInstance {
    kubernetes: FastifyKubernetesDecorator &
      Record<string, FastifyKubernetesDecorator>
  }
}

declare const fastifyKubernetesPlugin: FastifyPluginAsync<FastifyKubernetesOptions>

export default fastifyKubernetesPlugin
