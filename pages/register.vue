<template>
  <div class="register-container">
    <div class="register-box">
      <h1>회원가입</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="userid">아이디 *</label>
          <input 
            type="text" 
            id="userid" 
            v-model="formData.userid"
            placeholder="아이디를 입력하세요"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="name">이름 *</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name"
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호 *</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">이메일 *</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="job">직업</label>
          <select id="job" v-model="formData.job">
            <option value="">선택하세요</option>
            <option value="회사원">회사원</option>
            <option value="공무원">공무원</option>
            <option value="자영업">자영업</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>취미</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" value="영화감상" v-model="formData.hobbies" />
              영화감상
            </label>
            <label class="checkbox-label">
              <input type="checkbox" value="음악청취" v-model="formData.hobbies" />
              음악청취
            </label>
            <label class="checkbox-label">
              <input type="checkbox" value="스포츠" v-model="formData.hobbies" />
              스포츠
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>성별</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="남성" v-model="formData.gender" />
              남성
            </label>
            <label class="radio-label">
              <input type="radio" value="여성" v-model="formData.gender" />
              여성
            </label>
          </div>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="button-group">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '가입 중...' : '가입하기' }}
          </button>
          <button type="button" @click="goToLogin" class="cancel-btn">
            취소
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
});

const router = useRouter();

const formData = ref({
  userid: '',
  name: '',
  password: '',
  email: '',
  job: '',
  hobbies: [],
  gender: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: formData.value
    });
    
    if (response.success) {
      alert('회원가입이 완료되었습니다.');
      router.push('/');
    } else {
      errorMessage.value = response.error;
    }
  } catch (error) {
    console.error('Register error:', error);
    errorMessage.value = '회원가입 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push('/');
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
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

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"],
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group,
.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input,
.radio-label input {
  cursor: pointer;
}

.error-message {
  padding: 12px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn {
  background-color: #667eea;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5568d3;
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