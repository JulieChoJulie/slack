import React, { VFC, useCallback } from 'react';
import { ChatArea, Form, MentionsTextarea, SendButton, Toolbox } from './styles';

interface Props {
  chat: string;
}

const ChatBox: VFC<Props> = ({ chat }) => {
  const onSubmit = useCallback((e) => {
    e.preventDefault();
  }, []);
  return (
    <ChatArea>
      <Form onSubmit={onSubmit}>
        <MentionsTextarea />
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
