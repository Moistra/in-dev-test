import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentReqCookies = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    return request.cookies;
  },
);
