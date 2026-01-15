import { getQuery, setCookie } from 'h3';
import axios from 'axios';
import { generateToken } from '../../../utils/jwt';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code;
  const state = query.state;

  if (!code) {
    return { success: false, error: 'Code not provided by Naver' };
  }

  try {
    // Access Token 발급
    const tokenRes = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_OAUTH_CLIENT_ID,
          client_secret: process.env.NAVER_OAUTH_CLIENT_SECRET,
          code,
          state
        }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // 사용자 정보 조회
    const userRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const naverUser = userRes.data.response;

    // DB 사용자 확인 / 생성
    let user = await prisma.sunriseinfo_tbl_user.findUnique({
      where: { userid: naverUser.id }
    });

    if (!user) {
      user = await prisma.sunriseinfo_tbl_user.create({
        data: {
          userid: naverUser.id,
          name: naverUser.name || naverUser.email,
          password: ''
        }
      });
    }

    // JWT 발급
    const token = generateToken({ userid: user.userid, name: user.name });

    // 쿠키에 저장
    setCookie(event, 'auth_token', token, {
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    setCookie(event, 'user_name', user.name, { maxAge: 60 * 60 * 24, path: '/' });
    setCookie(event, 'user_id', user.userid, { maxAge: 60 * 60 * 24, path: '/' });

    // 게시판으로 이동
    return sendRedirect(event, '/board/list');

  } catch (err) {
    console.error('Naver OAuth error:', err);
    return { success: false, error: err.message };
  }
});