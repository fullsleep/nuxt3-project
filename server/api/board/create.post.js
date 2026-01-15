import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const user = event.context.user // 미들웨어에서 설정한 사용자 정보
    
    // 입력값 검증
    if (!body.title || !body.content) {
      return {
        success: false,
        error: '제목과 내용을 입력해주세요.'
      }
    }
    
    // 게시물 등록 (userid와 writer는 로그인한 사용자 정보 사용)
    const newBoard = await prisma.sunriseinfo_tbl_board.create({
      data: {
        userid: user.userid,
        writer: user.name,
        title: body.title,
        content: body.content
      }
    })
    
    return {
      success: true,
      message: '게시물이 등록되었습니다.',
      insertId: newBoard.bno
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})