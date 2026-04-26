import { useContext } from 'react';
import { DirectChatContext } from '../context/DirectChatContext';

export const useDirectChat = () => {
  const context = useContext(DirectChatContext);
  if (!context) {
    throw new Error('useDirectChat must be used within a DirectChatProvider');
  }
  return context;
};
