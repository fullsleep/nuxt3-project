<template>
  <div class="container">
    <div v-if="pending" class="loading">
      데이터를 불러오는 중...
    </div>
    
    <div v-else-if="error" class="error">
      오류가 발생했습니다: {{ error.message }}
    </div>
    
    <div v-else-if="!isEditMode && data && data.success">
      <div class="view-container">
        <h1>{{ data.data.title }}</h1>
        
        <div class="post-info">
          <div class="info-item">
            <span class="label">작성자:</span>
            <span>{{ data.data.writer }}</span>
          </div>
          <div class="info-item">
            <span class="label">작성일:</span>
            <span>{{ formatDate(data.data.regdate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">조회수:</span>
            <span>{{ data.data.hitno }}</span>
          </div>
        </div>
        
        <div class="content-box">
          <div class="content" v-html="formatContent(data.data.content)"></div>
        </div>
        
        <div class="button-group">
          <button 
            v-if="data.prev" 
            @click="goToPost(data.prev.bno)" 
            class="nav-btn"
          >
            ← 이전 게시물
          </button>
          <button v-else class="nav-btn" disabled>← 이전 게시물</button>
          
          <button @click="goToList" class="list-btn">
            목록
          </button>
          
          <button 
            v-if="data.next" 
            @click="goToPost(data.next.bno)" 
            class="nav-btn"
          >
            다음 게시물 →
          </button>
          <button v-else class="nav-btn" disabled>다음 게시물 →</button>
        </div>
        
        <div class="action-buttons" v-if="isOwner">
          <button @click="enableEditMode" class="edit-btn">
            수정
          </button>
          <button @click="showDeleteModal = true" class="delete-btn">
            삭제
          </button>
        </div>
      </div>
    </div>
    
    <!-- 수정 모드 -->
    <div v-else-if="isEditMode" class="edit-container">
      <h1>게시물 수정</h1>
      
      <form @submit.prevent="handleUpdate" class="edit-form">
        <div class="form-group">
          <label for="title">제목 *</label>
          <input 
            type="text" 
            id="title" 
            v-model="editData.title"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="content">내용 *</label>
          <textarea 
            id="content" 
            v-model="editData.content"
            rows="15"
            required
          ></textarea>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="button-group">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '수정 중...' : '수정' }}
          </button>
          <button type="button" @click="cancelEdit" class="cancel-btn">
            취소
          </button>
        </div>
      </form>
    </div>
    
    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h2>게시물 삭제</h2>
        <p>정말로 이 게시물을 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button @click="handleDelete" class="confirm-btn">
            확인
          </button>
          <button @click="showDeleteModal = false" class="cancel-btn">
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const userId = useCookie('user_id');

// 인증 체크
onMounted(() => {
  const token = useCookie('auth_token');
  if (!token.value) {
    router.push('/');
  }
});

const { data, pending, error, refresh } = await useFetch(`/api/board/${route.params.id}`);

const isOwner = computed(() => {
  if (!data.value || !data.value.data) return false;
  return data.value.data.userid === userId.value;
});

const isEditMode = ref(false);
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

const editData = ref({
  title: '',
  content: ''
});

const enableEditMode = () => {
  editData.value.title = data.value.data.title;
  editData.value.content = data.value.data.content;
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
  errorMessage.value = '';
};

const handleUpdate = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const response = await $fetch(`/api/board/${route.params.id}`, {
      method: 'PUT',
      body: editData.value
    });
    
    if (response.success) {
      alert('게시물이 수정되었습니다.');
      isEditMode.value = false;
      refresh();
    } else {
      errorMessage.value = response.error || '게시물 수정에 실패했습니다.';
    }
  } catch (error) {
    console.error('Update error:', error);
    errorMessage.value = '게시물 수정 중 오류가 발생했습니다.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  try {
    const response = await $fetch(`/api/board/${route.params.id}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      alert('게시물이 삭제되었습니다.');
      router.push('/');
    } else {
      alert(response.error || '게시물 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('게시물 삭제 중 오류가 발생했습니다.');
  } finally {
    showDeleteModal.value = false;
  }
};

const goToList = () => {
  router.push('/board/list');
};

const goToPost = (bno) => {
  router.push(`/board/${bno}`);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const formatContent = (content) => {
  if (!content) return '';
  return content.replace(/\n/g, '<br>');
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
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

.view-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #4CAF50;
}

.post-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.label {
  font-weight: bold;
  color: #666;
}

.content-box {
  min-height: 300px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fafafa;
}

.content {
  line-height: 1.8;
  color: #333;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.nav-btn,
.list-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.nav-btn:hover:not(:disabled),
.list-btn:hover {
  background-color: #f5f5f5;
}

.nav-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.list-btn {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.list-btn:hover {
  background-color: #45a049;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.edit-btn,
.delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 수정 모드 스타일 */
.edit-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-form .form-group {
  margin-bottom: 20px;
}

.edit-form label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
  font-size: 14px;
}

.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.edit-form input:focus,
.edit-form textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.edit-form textarea {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  padding: 12px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.submit-btn,
.cancel-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.modal-content p {
  margin-bottom: 25px;
  color: #666;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background-color: #d32f2f;
}
</style>
