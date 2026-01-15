import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id
    const user = event.context.user
    
    // 작성자 확인
    const board = await prisma.sunriseinfo_tbl_board.findUnique({
      where: {
        bno: parseInt(id)
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
        error: '삭제 권한이 없습니다.'
      }
    }
    
    // 게시물 삭제
    await prisma.sunriseinfo_tbl_board.delete({
      where: {
        bno: parseInt(id)
      }
    })
    
    return {
      success: true,
      message: '게시물이 삭제되었습니다.'
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})