import React, { useCallback, forwardRef } from 'react';
import { IDM } from '@typings/db';
import { ChatZone, Section, StickyHeader } from './styles';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars-2';

interface Props {
  chatSections: { [key: string]: IDM[] };
  setSize: (f: (size: number) => number) => Promise<IDM[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, Props>(({ chatSections, setSize, isEmpty, isReachingEnd }, ref) => {
  const onScroll = useCallback(
    (value) => {
      if (value.scrollTop === 0 && !isReachingEnd) {
        console.log('very top');
        // data loading
        setSize((size) => size + 1).then(() => {
          // stay at the current scroll height
        });
      }
    },
    [isReachingEnd],
  );
  return (
    <ChatZone>
      <Scrollbars autoHide ref={ref} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-Z${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat: IDM) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
});

export default ChatList;
