export default defineEventHandler((event) => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = 'http://localhost:3000/api/auth/google/callback';
  const scope = 'email profile';

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}`;

  // JSON 반환 → 프론트에서 이동 처리
  return { success: true, url };
});