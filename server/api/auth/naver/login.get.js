export default defineEventHandler((event) => {
  console.log('NAVER_OAUTH_CLIENT_ID', process.env.NAVER_OAUTH_CLIENT_ID)
  const clientId = process.env.NAVER_OAUTH_CLIENT_ID;
  const redirectUri = "https://nuxt-study.duckdns.org/api/auth/naver/callback";

  // 네이버 OAuth 기본 URL
  const state = Math.random().toString(36).substring(2, 15); // CSRF 방지용 임의 문자열
  const url =
    `https://nid.naver.com/oauth2.0/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  // JSON 반환 → 프론트에서 이동 처리
  return { success: true, url };
});