import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params.id)
    const body = await readBody(event)
    const user = event.context.user
    
    // 작성자 확인
    const board = await prisma.tbl_board.findUnique({
      where: {
        bno: id
      },
      select: {
        userid: true
      }
    })
    
    if (!board) {
      return {
        success: false,
        error: '게시물을 찾을 수 없습니다.'
      }
    }
    
    if (board.userid !== user.userid) {
      return {
        success: false,
        error: '수정 권한이 없습니다.'
      }
    }
    
    // 게시물 수정
    await prisma.tbl_board.update({
      where: {
        bno: id
      },
      data: {
        title: body.title,
        content: body.content
      }
    })
    
    return {
      success: true,
      message: '게시물이 수정되었습니다.'
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})