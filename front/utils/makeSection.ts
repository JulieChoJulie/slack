import { IDM } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection(chatList: IDM[]) {
  const sections: { [key: string]: IDM[] } = {};
  chatList.forEach((chat: IDM) => {
    const month = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[month])) {
      sections[month].push(chat);
    } else {
      sections[month] = [chat];
    }
  });
  return sections;
}
