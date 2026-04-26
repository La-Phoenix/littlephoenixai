import React from 'react';
import { DirectChat } from '../components/DirectChat';

export interface DirectChatPageProps {
  chatId?: string;
  otherUserId?: string;
}

export const DirectChatPage: React.FC<DirectChatPageProps> = ({
  chatId,
  otherUserId = '',
}) => {
  if (!chatId && !otherUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return <DirectChat otherUserId={otherUserId} chatId={chatId} />;
};

export default DirectChatPage;
