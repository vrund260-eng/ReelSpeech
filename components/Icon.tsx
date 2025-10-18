import React from 'react';

type IconType = 
  | 'home'
  | 'search'
  | 'create'
  | 'chat'
  | 'profile'
  | 'heart'
  | 'comment'
  | 'share'
  | 'volumeUp'
  | 'volumeOff'
  | 'userPlus'
  | 'send'
  | 'arrowLeft'
  | 'plus'
  | 'sparkles'
  | 'upload'
  | 'play'
  | 'music';

interface IconProps {
  type: IconType;
  className?: string;
}

// FIX: Explicitly type the value of the record. This allows TypeScript to
// understand the props of the SVG elements, resolving the error in `React.cloneElement`.
const ICONS: Record<IconType, React.ReactElement<React.SVGProps<SVGSVGElement>>> = {
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  create: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  chat: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  profile: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  heart: (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  comment: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.953 8.953 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.832 14.168L5.5 12.5a6.953 6.953 0 00-1.5-3.5A6.983 6.983 0 0010 4c3.866 0 7 2.686 7 6s-3.134 6-7 6a7.043 7.043 0 01-3.168-.832z" clipRule="evenodd" />
    </svg>
  ),
  share: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  ),
  volumeUp: (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.929 10c0 2.21-1.105 4.14-2.757 5.293a1 1 0 11-1.172-1.634A3.984 3.984 0 0011 10a3.984 3.984 0 00-1.929-3.659 1 1 0 111.172-1.634A5.983 5.983 0 0112.929 10z" clipRule="evenodd" />
    </svg>
  ),
  volumeOff: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
    </svg>
  ),
  userPlus: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
    </svg>
  ),
  send: (
    <svg xmlns="http://www.w3.org/2000/svg" className="transform rotate-45" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
  ),
  arrowLeft: (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  ),
  plus: (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5a.75.75 0 01.75-.75z" />
      </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75zM5.31 5.31a.75.75 0 011.06 0l2.475 2.475a.75.75 0 11-1.06 1.06L5.31 6.37a.75.75 0 010-1.06zM2.5 10a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75zM5.31 14.69a.75.75 0 010-1.06l2.475-2.475a.75.75 0 111.06 1.06L6.37 14.69a.75.75 0 01-1.06 0zM10 17.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v3.5a.75.75 0 01-.75.75zm4.69-2.81a.75.75 0 01-1.06 0l-2.475-2.475a.75.75 0 011.06-1.06l2.475 2.475a.75.75 0 010 1.06zM17.5 10a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5h3.5a.75.75 0 01.75.75zm-2.81-4.69a.75.75 0 010 1.06l-2.475 2.475a.75.75 0 01-1.06-1.06L13.63 5.31a.75.75 0 011.06 0z" clipRule="evenodd" />
    </svg>
  ),
  upload: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.25 13.25a.75.75 0 001.5 0V4.66l2.1 1.95a.75.75 0 101-1.12l-3.25-3-3.25 3a.75.75 0 101 1.12l2.1-1.95v8.59zM3.75 12a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" clipRule="evenodd" />
    </svg>
  ),
  play: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
  music: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.75 3.5a.75.75 0 00-1.5 0v5.39l-1.84-1.23a.75.75 0 00-.92 1.62l2.5 1.67a.75.75 0 00.92 0l2.5-1.67a.75.75 0 10-.92-1.62l-1.84 1.23V3.5zM4.75 14.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" />
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ type, className }) => {
  const iconNode = ICONS[type];
  if (!iconNode || !React.isValidElement(iconNode)) return null;

  // FIX: Merge provided className with any existing className on the icon definition.
  // This also fixes the TypeScript error by ensuring props are typed correctly.
  const combinedClassName = [iconNode.props.className, className]
    .filter(Boolean)
    .join(' ');

  return React.cloneElement(iconNode, { className: combinedClassName });
};

export default Icon;
