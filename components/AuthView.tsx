import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (usernameOrEmail: string, password: string) => boolean;
  onSignUp: (newUser: Omit<User, 'avatar'>) => boolean;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  // Login state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(usernameOrEmail, loginPassword);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!displayName || !username || !email || !signUpPassword) {
      setError('Please fill out all fields.');
      return;
    }
    const success = onSignUp({
      displayName,
      username,
      email,
      password: signUpPassword,
    });
    if (!success) {
      setError('Username or email already exists.');
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">
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
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Log In
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
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="password"
              placeholder="Create Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Sign Up
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