import React, { useCallback, useRef, VFC } from 'react';
import { IDM } from '@typings/db';
import { ChatZone, Section } from './styles';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars-2';

interface Props {
  chatData?: IDM[];
}

const ChatList: VFC<Props> = ({ chatData }) => {
  const scrollbarRef = useRef(null);
  const onScroll = useCallback(() => {}, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef}>
        <Section>
          {chatData?.map((c: IDM) => (
            <Chat key={c.id} data={c} />
          ))}
        </Section>
      </Scrollbars>
    </ChatZone>
  );
};

export default ChatList;
