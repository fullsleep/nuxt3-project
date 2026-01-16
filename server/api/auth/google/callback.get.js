import { getQuery, setCookie } from 'h3';
import axios from 'axios';
import { generateToken } from '../../../utils/jwt';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code;

  if (!code) {
    return { success: false, error: 'Code not provided by Google' };
  }

  try {
    // Google 토큰 교환
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: 'https://nuxt-study.duckdns.org/api/auth/google/callback',
        grant_type: 'authorization_code'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenRes.data.access_token;

    // 사용자 정보 조회
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const googleUser = userRes.data;

    // DB 사용자 확인 / 생성
    let user = await prisma.sunriseinfo_tbl_user.findUnique({ where: { userid: googleUser.id } });
    if (!user) {
      user = await prisma.sunriseinfo_tbl_user.create({
        data: { userid: googleUser.id, name: googleUser.name || googleUser.email, password: '' }
      });
    }

    // JWT 발급
    const token = generateToken({ userid: user.userid, name: user.name });

    // 쿠키에 토큰 저장
    setCookie(event, 'auth_token', token, {
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24, // 24시간
      path: '/'
    })

    setCookie(event, 'user_name', user.name, { maxAge: 60 * 60 * 24, path: '/' });
    setCookie(event, 'user_id', user.userid, { maxAge: 60 * 60 * 24, path: '/' });

    // JSON 반환 
    //return { success: true, user: { userid: user.userid, name: user.name } };
    
    // 게시판으로 이동
    return sendRedirect(event, '/board/list')

  } catch (err) {
    console.error('Google OAuth error:', err);
    return { success: false, error: err.message };
  }
});