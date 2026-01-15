<template>
  <div class="container">
    <div class="header">
      <h1>게시판</h1>
      <div class="user-info">
        <span>{{ userName }}님 환영합니다</span>
      </div>
    </div>
    
    <div v-if="pending" class="loading">
      데이터를 불러오는 중...
    </div>
    
    <div v-else-if="error" class="error">
      오류가 발생했습니다: {{ error.message }}
    </div>
    
    <div v-else-if="data && data.success">
      <div class="board-info">
        전체 게시글: {{ data.pagination.totalCount }}개 
        ({{ data.pagination.currentPage }} / {{ data.pagination.totalPages }} 페이지)
      </div>
      
      <table class="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>작성자</th>
            <th>제목</th>
            <th>조회수</th>
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="board in data.data" :key="board.bno">
            <td>{{ board.rownum }}</td>
            <td>{{ board.writer }}</td>
            <td class="title-cell">
              <a @click="goToView(board.bno)" class="title-link">
                {{ board.title }}
              </a>
            </td>
            <td>{{ board.hitno }}</td>
            <td>{{ formatDate(board.regdate) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="data.data.length === 0" class="no-data">
        등록된 게시글이 없습니다.
      </div>
      
      <!-- 페이지네이션 -->
      <div v-if="data.pagination.totalPages > 1" class="pagination">
        <button 
          @click="goToPage(1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          처음
        </button>
        
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          이전
        </button>
        
        <button
          v-for="pageNum in visiblePages"
          :key="pageNum"
          @click="goToPage(pageNum)"
          :class="['page-btn', { active: pageNum === currentPage }]"
        >
          {{ pageNum }}
        </button>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === data.pagination.totalPages"
          class="page-btn"
        >
          다음
        </button>
        
        <button 
          @click="goToPage(data.pagination.totalPages)" 
          :disabled="currentPage === data.pagination.totalPages"
          class="page-btn"
        >
          마지막
        </button>
      </div>
      
      <!-- 하단 버튼 -->
      <div class="bottom-buttons">
        <button @click="goToWrite" class="write-btn">
          게시물 등록
        </button>
        <button @click="handleLogout" class="logout-btn">
          로그아웃
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

//definePageMeta({
//  middleware: 'auth'  // 미들웨어 적용
//});

const route = useRoute();
const router = useRouter();
const userName = useCookie('user_name');

// 인증 체크
onMounted(() => {
  const token = useCookie('auth_token');
  if (!token.value) {
    router.push('/');
  }
});

const currentPage = computed(() => {
  return parseInt(route.query.page) || 1;
});

const { data, pending, error, refresh } = await useFetch('/api/boards', {
  query: {
    page: currentPage,
    limit: 10
  },
  watch: [currentPage]
});

const goToPage = (page) => {
  router.push({ path: '/board/list', query: { page } });
};

const goToWrite = () => {
  router.push('/board/write');
};

const goToView = (bno) => {
  router.push(`/board/${bno}`);
};

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    });
    
    // 쿠키 삭제
    const authToken = useCookie('auth_token');
    const userIdCookie = useCookie('user_id');
    const userNameCookie = useCookie('user_name');
    
    authToken.value = null;
    userIdCookie.value = null;
    userNameCookie.value = null;
    
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const visiblePages = computed(() => {
  if (!data.value || !data.value.pagination) return [];
  
  const totalPages = data.value.pagination.totalPages;
  const current = currentPage.value;
  const pages = [];
  
  let startPage = Math.max(1, current - 2);
  let endPage = Math.min(totalPages, current + 2);
  
  if (current <= 3) {
    endPage = Math.min(5, totalPages);
  }
  
  if (current >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  margin: 0;
}

.user-info {
  color: #666;
  font-size: 14px;
}

.board-info {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
}

.board-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.board-table th,
.board-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.board-table th {
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
}

.board-table tbody tr:hover {
  background-color: #f5f5f5;
}

.board-table td:first-child {
  width: 80px;
}

.board-table td:nth-child(2) {
  width: 120px;
}

.board-table td:nth-child(4) {
  width: 80px;
}

.board-table td:nth-child(5) {
  width: 120px;
}

.title-cell {
  text-align: left !important;
}

.title-link {
  color: #333;
  text-decoration: none;
  cursor: pointer;
}

.title-link:hover {
  color: #4CAF50;
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.error {
  padding: 20px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin: 20px 0;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 30px 0;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.page-btn.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
  font-weight: bold;
}

.page-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

.bottom-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.write-btn,
.logout-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.write-btn {
  background-color: #4CAF50;
  color: white;
}

.write-btn:hover {
  background-color: #45a049;
}

.logout-btn {
  background-color: #f44336;
  color: white;
}

.logout-btn:hover {
  background-color: #d32f2f;
}
</style>