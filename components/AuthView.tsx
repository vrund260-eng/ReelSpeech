import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (usernameOrEmail: string, password: string) => Promise<boolean>;
  onSignUp: (newUser: Omit<User, 'avatar' | 'passwordHash' | 'followers' | 'following' | 'followingUsernames'> & {password: string}) => Promise<boolean>;
}

const PasswordRequirement: React.FC<{isValid: boolean; text: string}> = ({isValid, text}) => (
    <li className={`flex items-center text-sm ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d={isValid ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z"} clipRule="evenodd"></path>
        </svg>
        {text}
    </li>
)

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
  });

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  useEffect(() => {
    setPasswordValidation({
        hasLength: signUpPassword.length >= 8,
        hasUpper: /[A-Z]/.test(signUpPassword),
        hasLower: /[a-z]/.test(signUpPassword),
        hasNumber: /\d/.test(signUpPassword),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(signUpPassword),
    });
  }, [signUpPassword]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const success = await onLogin(usernameOrEmail, loginPassword);
        if (!success) {
          setError('Invalid credentials. Please try again.');
        }
    } catch (err) {
        console.error("Login Error:", err);
        setError("An unexpected error occurred during login.");
    } finally {
        setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!displayName || !username || !email || !signUpPassword) {
      setError('Please fill out all fields.');
      return;
    }
    if (!isPasswordValid) {
        setError('Password does not meet the requirements.');
        return;
    }
    setLoading(true);
     try {
        const success = await onSignUp({
          displayName,
          username,
          email,
          password: signUpPassword,
        });
        if (!success) {
          setError('Username or email already exists.');
        }
    } catch (err) {
        console.error("Sign Up Error:", err);
        setError("An unexpected error occurred during sign up.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">ReelTalk</h1>
        <p className="text-center text-gray-400 mb-8">{isLogin ? 'Welcome back!' : 'Create your account'}</p>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <input
              type="text"
              placeholder="Username or Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit}>
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <input
              type="password"
              placeholder="Create Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <ul className="text-left mb-4 px-1 space-y-1">
                <PasswordRequirement isValid={passwordValidation.hasLength} text="At least 8 characters" />
                <PasswordRequirement isValid={passwordValidation.hasUpper} text="One uppercase letter" />
                <PasswordRequirement isValid={passwordValidation.hasLower} text="One lowercase letter" />
                <PasswordRequirement isValid={passwordValidation.hasNumber} text="One number" />
                <PasswordRequirement isValid={passwordValidation.hasSpecial} text="One special character (!@#$...)" />
            </ul>
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        <p className="text-center text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="text-pink-500 font-semibold ml-2 hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthView;