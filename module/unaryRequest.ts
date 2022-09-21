import { grpc } from '@improbable-eng/grpc-web'
import { UnaryOutput } from '@improbable-eng/grpc-web/dist/typings/unary'
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service'
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata'

export interface UnaryRequestProps {
  service: UnaryMethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage>
  request: grpc.ProtobufMessage
  metadata: Metadata.ConstructorArg
}
export function unaryRequest(props: UnaryRequestProps) {
  return new Promise(
    (
      resolve: (value: unknown) => void,
      reject: (reason: UnaryOutput<grpc.ProtobufMessage>) => void
    ) => {
      grpc.unary(props.service, {
        request: props.request,
        host: process.env.GATEWAY_URL!,
        metadata: props.metadata,
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
