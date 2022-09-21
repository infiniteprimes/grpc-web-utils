import { grpc } from '@improbable-eng/grpc-web'
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message'
import { MethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service'
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata'

export interface streamRequestErr {
  code: grpc.Code
  message: string
  trailers: grpc.Metadata
}
export interface StreamRequestProps {
  service: MethodDefinition<ProtobufMessage, ProtobufMessage>
  request: ProtobufMessage
  metadata: Metadata.ConstructorArg
  fn: {
    onMsgFn: (msg: ProtobufMessage) => void
    onUnknownFn: () => void
  }
}

export async function streamRequest(props: StreamRequestProps) {
  return new Promise((resolve, reject) => {
    grpc.invoke(props.service, {
      host: process.env.GATEWAY_URL!,
      request: props.request,
      metadata: props.metadata,
      onMessage: res => {
        props.fn.onMsgFn(res)
      },
      onEnd: (code: grpc.Code, message: string, trailers: grpc.Metadata) => {
        if (code === grpc.Code.OK) {
          //console.log('链接完成')
        } else if (code === grpc.Code.Unknown) {
          props.fn.onUnknownFn()
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
