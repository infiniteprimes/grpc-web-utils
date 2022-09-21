import { grpc } from '@improbable-eng/grpc-web'
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message'
import { MethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service'
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata'

export interface streamRequestErr {
  code: grpc.Code
  message: string
  trailers: grpc.Metadata
}
export interface StreamRequestProps<
  TRequest extends ProtobufMessage,
  TResponse extends ProtobufMessage,
  M extends MethodDefinition<TRequest, TResponse>
> {
  service: M
  request: TRequest
  metadata: Metadata.ConstructorArg
  fn: {
    onMsgFn: (msg: ProtobufMessage) => void
    onUnknownFn: () => void
  }
}

export async function StreamRequest<
  TRequest extends ProtobufMessage,
  TResponse extends ProtobufMessage,
  M extends MethodDefinition<TRequest, TResponse>
>(
  service: M,
  request: TRequest,
  metadata: Metadata.ConstructorArg,
  fn: {
    onMsgFn: (msg: ProtobufMessage) => void
    //手动重连
    onUnknownFn: () => void
  }
) {
  return new Promise((resolve, reject) => {
    grpc.invoke(service, {
      host: process.env.GATEWAY_URL!,
      request: request,
      metadata,
      onMessage: res => {
        fn.onMsgFn(res)
      },
      onEnd: (code: grpc.Code, message: string, trailers: grpc.Metadata) => {
        if (code === grpc.Code.OK) {
          //console.log('链接完成')
        } else if (code === grpc.Code.Unknown) {
          fn.onUnknownFn()
        } else {
          reject({ code, message, trailers } as streamRequestErr)
        }
      },
    })
  })
}

export function StreamErrChecker(e: streamRequestErr): boolean {
  return e.code === grpc.Code.Unavailable
}
