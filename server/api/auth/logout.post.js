export default defineEventHandler((event) => {
  // 모든 쿠키 삭제
  deleteCookie(event, 'auth_token');
  deleteCookie(event, 'user_name');
  deleteCookie(event, 'user_id');
  
  return {
    success: true,
    message: '로그아웃되었습니다.'
  };
});