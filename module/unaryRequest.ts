import { grpc } from '@improbable-eng/grpc-web'
import { UnaryOutput } from '@improbable-eng/grpc-web/dist/typings/unary'
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service'
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata'

export function UnaryRequest<
  TRequest extends grpc.ProtobufMessage,
  TResponse extends grpc.ProtobufMessage,
  M extends UnaryMethodDefinition<TRequest, TResponse>
>(service: M, request: TRequest, metadata: Metadata.ConstructorArg) {
  return new Promise(
    (
      resolve: (value: unknown) => void,
      reject: (reason: UnaryOutput<grpc.ProtobufMessage>) => void
    ) => {
      grpc.unary(service, {
        request: request,
        host: process.env.GATEWAY_URL!,
        metadata,
        onEnd: ({ status, statusMessage, headers, message, trailers }) => {
          if (status === grpc.Code.OK && message) {
            resolve(message)
          } else {
            reject({
              status,
              statusMessage,
              headers,
              message,
              trailers,
            })
          }
        },
      })
    }
  )
}

export function unaryAuthErrChecker(e: UnaryOutput<grpc.ProtobufMessage>): boolean {
  return e.status === grpc.Code.Unavailable
}
