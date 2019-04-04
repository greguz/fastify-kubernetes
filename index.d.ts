import * as http from "http";
import * as fastify from "fastify";
import { KubeConfig } from "@kubernetes/client-node";

declare namespace fastifyKubernetes {
  interface FastifyKubernetesOptions {
    /**
     * Kube config file location, default to os default location
     */
    file?: string;
    /**
     * Cluster name to use, default to "minikube"
     */
    cluster?: string;
    /**
     * Namespace to use, default to "default"
     */
    namespace?: string;
  }
  interface FastifyKubernetesObject {
    /**
     * Kubernetes config instance
     */
    config: KubeConfig;
    /**
     * Configured namespace
     */
    namespace: string;
  }
}

declare module "fastify" {
  interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    kubernetes: fastifyKubernetes.FastifyKubernetesObject;
  }
}

declare let fastifyKubernetes: fastify.Plugin<
  http.Server,
  http.IncomingMessage,
  http.ServerResponse,
  fastifyKubernetes.FastifyKubernetesOptions
>;

export = fastifyKubernetes;
