import { grpc } from '@improbable-eng/grpc-web'
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message'
import { MethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service'
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata'

export interface streamRequestErr {
  code: grpc.Code
  message: string
  trailers: grpc.Metadata
}
export interface StreamRequestArgs {
  service: MethodDefinition<ProtobufMessage, ProtobufMessage>
  request: ProtobufMessage
  metadata: Metadata.ConstructorArg
  host: string
  fn: {
    onMsgFn: (msg: ProtobufMessage) => void
    onUnknownFn: () => void
  }
}

export async function streamRequest(args: StreamRequestArgs) {
  return new Promise((resolve, reject) => {
    grpc.invoke(args.service, {
      host: args.host,
      request: args.request,
      metadata: args.metadata,
      onMessage: res => {
        args.fn.onMsgFn(res)
      },
      onEnd: (code: grpc.Code, message: string, trailers: grpc.Metadata) => {
        if (code === grpc.Code.OK) {
          //console.log('链接完成')
        } else if (code === grpc.Code.Unknown) {
          args.fn.onUnknownFn()
        } else {
          reject({ code, message, trailers } as streamRequestErr)
        }
      },
    })
  })
}

export function streamErrChecker(e: streamRequestErr): boolean {
  return e.code === grpc.Code.Unavailable
}
