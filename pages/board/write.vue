<template>
  <div class="container">
    <h1>게시물 작성</h1>
    
    <form @submit.prevent="submitForm" class="write-form">
      <div class="form-group">
        <label for="writer">작성자 *</label>
        <input 
          type="text" 
          id="writer" 
          v-model="writerName"
          disabled
          class="disabled-input"
        />
      </div>
      
      <div class="form-group">
        <label for="title">제목 *</label>
        <input 
          type="text" 
          id="title" 
          v-model="formData.title"
          placeholder="제목을 입력하세요"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="content">내용 *</label>
        <textarea 
          id="content" 
          v-model="formData.content"
          placeholder="내용을 입력하세요"
          rows="15"
          required
        ></textarea>
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div class="button-group">
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '등록 중...' : '등록' }}
        </button>
        <button type="button" @click="goToList" class="cancel-btn">
          취소
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>

const router = useRouter();
const userName = useCookie('user_name');
const writerName = ref(userName.value || '');

const formData = ref({
  title: '',
  content: ''
});

const isSubmitting = ref(false);
const errorMessage = ref('');

const submitForm = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const response = await $fetch('/api/board/create', {
      method: 'POST',
      body: formData.value
    });
    
    if (response.success) {
      alert('게시물이 등록되었습니다.');
      router.push('/');
    } else {
      errorMessage.value = response.error || '게시물 등록에 실패했습니다.';
    }
  } catch (error) {
    console.error('Submit error:', error);
    errorMessage.value = '게시물 등록 중 오류가 발생했습니다.';
  } finally {
    isSubmitting.value = false;
  }
};

const goToList = () => {
  router.push('/board/list');
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.write-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

.error-message {
  padding: 12px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
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
</style>