<template>
  <div class="login-container">
    <div class="login-box">
      <h1>로그인</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="userid">아이디</label>
          <input 
            type="text" 
            id="userid" 
            v-model="formData.userid"
            placeholder="아이디를 입력하세요"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
        <button type="button" class="google-login-btn" @click="handleGoogleLogin" :disabled="isLoading">
          구글계정으로 로그인
        </button>
        <button type="button" class="naver-login-btn" @click="handleNaverLogin" :disabled="isLoading">
          네이버계정으로 로그인
        </button>
      </form>
      
      <div class="register-link">
        <p>아직 회원이 아니신가요?</p>
        <button @click="goToRegister" class="register-btn">
          회원가입
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  //middleware: 'auth'  // 미들웨어 적용
});


const router = useRouter();

// 이미 로그인되어 있으면 게시판으로 리다이렉트
onMounted(() => {
  const token = useCookie('auth_token');
  if (token.value) {
    router.push('/board/list');
  }
});

const formData = ref({
  userid: '',
  password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: formData.value
    });
    
    if (response.success) {
      router.push('/board/list');
    } else {
      errorMessage.value = response.error;
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = '로그인 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// Google OAuth 로그인
const handleGoogleLogin = async () => {
  try {
    const response = await $fetch('/api/auth/google/login')
    if (response.success && response.url) {
      window.location.href = response.url
    }
  } catch (err) {
    console.error(err)
  }
}

// Naver OAuth 로그인
const handleNaverLogin = async () => {
  try {
    const response = await $fetch('/api/auth/naver/login');
    if (response.success && response.url) {
      window.location.href = response.url;
    }
  } catch (err) {
    console.error(err)
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
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

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
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

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #5568d3;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  margin-top: 30px;
  text-align: center;
}

.register-link p {
  color: #666;
  margin-bottom: 10px;
  font-size: 14px;
}

.register-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.register-btn:hover {
  background-color: #e0e0e0;
}
</style>