import axios from 'axios';

const fetcher = (url: string) =>
  axios
    .get(url, { withCredentials: true })
    .then((response) => response.data)
    .catch((err) => {
      throw err?.response;
    });

export default fetcher;
