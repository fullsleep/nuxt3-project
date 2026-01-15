import { verifyToken } from '../utils/jwt';

export default defineEventHandler((event) => {
  //const url = event.node.req.url;
  const url = getRequestURL(event).pathname
  
  // 인증이 필요없는 API 경로들
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout'
  ];
  
  // public 경로면 인증 체크 안 함
  if (publicPaths.some(path => url.startsWith(path))) {
    return;
  }
  
  // API 요청이 아니면 인증 체크 안 함
  if (!url.startsWith('/api/')) {
    return;
  }
  
  // 여기부터는 인증이 필요한 API
  const token = getCookie(event, 'auth_token');
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: '인증이 필요합니다.'
    });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    throw createError({
      statusCode: 401,
      message: '유효하지 않은 토큰입니다.'
    });
  }
  
  // 사용자 정보를 event context에 저장
  event.context.user = decoded;

  console.log(`[${url}] : JWT 확인`)
});