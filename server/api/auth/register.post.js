import bcrypt from 'bcryptjs'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 입력값 검증
    if (!body.userid || !body.name || !body.password || !body.email) {
      return {
        success: false,
        error: '필수 항목을 모두 입력해주세요.'
      }
    }
    
    // 중복 아이디 체크
    const existing = await prisma.tbl_user.findUnique({
      where: {
        userid: body.userid
      }
    })
    
    if (existing) {
      return {
        success: false,
        error: '이미 사용중인 아이디입니다.'
      }
    }
    
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(body.password, 10)
    
    // 취미 배열을 문자열로 변환
    const hobbies = Array.isArray(body.hobbies) ? body.hobbies.join(',') : body.hobbies
    
    // 회원 등록
    await prisma.tbl_user.create({
      data: {
        userid: body.userid,
        name: body.name,
        password: hashedPassword,
        email: body.email,
        job: body.job,
        hobbies: hobbies,
        gender: body.gender
      }
    })
    
    return {
      success: true,
      message: '회원가입이 완료되었습니다.'
    }
  } catch (error) {
    console.error('Register error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})