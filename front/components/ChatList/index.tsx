import React, { VFC } from 'react';
import { IDM } from '@typings/db';
import { ChatZone, Section } from './styles';
import Chat from '@components/Chat';

interface Props {
  chatData?: IDM[];
}

const ChatList: VFC<Props> = ({ chatData }) => {
  return (
    <ChatZone>
      <Section>section</Section>
      {chatData?.map((c: IDM) => (
        <Chat key={c.id} data={c} />
      ))}
    </ChatZone>
  );
};

export default ChatList;
