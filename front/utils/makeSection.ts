import { IDM, IChat } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection(chatList: (IDM | IChat)[]) {
  const sections: { [key: string]: (IDM | IChat)[] } = {};
  chatList.forEach((chat: IDM | IChat) => {
    const month = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[month])) {
      sections[month].push(chat);
    } else {
      sections[month] = [chat];
    }
  });
  return sections;
}
