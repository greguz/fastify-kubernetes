import { FastifyPluginCallback } from "fastify";
import * as kubernetes from "@kubernetes/client-node";

declare namespace fastifyKubernetes {
  interface FastifyKubernetesOptions {
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
      | "auto"
      | "default"
      | "file"
      | "in-cluster"
      | "yaml"
      | kubernetes.KubeConfig;
    /**
     * Kubeconfig file path.
     */
    file?: string;
    /**
     * Kubeconfig YAML string (or buffer) content.
     */
    yaml?: string | Buffer;
    /**
     * Wanted context. If the context does not exist, an error will be thrown.
     */
    context?: string;
    /**
     * Wanted cluster. If the cluster does not exist, an error will be thrown.
     */
    cluster?: string;
    /**
     * Wanted user. If the user does not exist, an error will be thrown.
     */
    user?: string;
    /**
     * Wanted namespace.
     *
     * @default "default"
     */
    namespace?: string;
    /**
     * Nested (Fastify) decorator name.
     */
    name?: string;
  }
  interface FastifyKubernetesObject {
    /**
     * Kubernetes config instance
     */
    config: kubernetes.KubeConfig;
    /**
     * Current context
     */
    context: string;
    /**
     * Current cluster
     */
    cluster: string;
    /**
     * Current user
     */
    user: string;
    /**
     * Current namespace
     */
    namespace: string;
    /**
     * Client instances collection
     */
    api: {
      /** AUTOMATION REQUIRED **/
      [key: string]: any;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    kubernetes: fastifyKubernetes.FastifyKubernetesObject & {
      [name: string]: fastifyKubernetes.FastifyKubernetesObject;
    };
  }
}

declare let fastifyKubernetes: FastifyPluginCallback<fastifyKubernetes.FastifyKubernetesOptions>;

export = fastifyKubernetes;
