
import apiClient from '../services/apiClient';
import useAuthStore from '../stores/authStore';


const useAuth = () => {
  const { login, register, logout } = useAuthStore();

  const authenticate = async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
    
      localStorage.setItem('token', response.data.token); 
      localStorage.setItem('user', JSON.stringify(response.data.user)); 

      login(response.data.user);
    } catch (error) {
      console.error('Login failed', error.response.data);
    }
  };

  const createNewUser = async (credentials) => {
    try{
      const response = await apiClient.post('/api/auth/register', credentials);
      
      register(response.data.user);
    }catch(error){
      console.error('register failed', error);
      
    }
  };

  

  const logoutUser = () => {
    logout();
    localStorage.removeItem('token'); 
  };

  return { authenticate, logoutUser, createNewUser };
};

export default useAuth;
