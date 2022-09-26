import { grpc } from '@improbable-eng/grpc-web'
import { UnaryOutput } from '@improbable-eng/grpc-web/dist/typings/unary'
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service'
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata'

export interface UnaryRequestArgs {
  service: UnaryMethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage>
  request: grpc.ProtobufMessage
  metadata: Metadata.ConstructorArg
  host: string
}
export function unaryRequest(args: UnaryRequestArgs) {
  return new Promise(
    (
      resolve: (value: unknown) => void,
      reject: (reason: UnaryOutput<grpc.ProtobufMessage>) => void
    ) => {
      grpc.unary(args.service, {
        request: args.request,
        host: args.host,
        metadata: args.metadata,
        onEnd: ({ status, statusMessage, headers, message, trailers }) => {
          if (status === grpc.Code.OK && message) {
            resolve(message.toObject())
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
