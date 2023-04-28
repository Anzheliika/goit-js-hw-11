import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35818110-49a40c48d964f088462f45060';
const param = 'image_type=photo&orientation=horizontal&safesearch=true';

export default class PicturesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPage = 40;
  }

  async fetchPictures() {
    const url = `${BASE_URL}?key=${API_KEY}&q=${this.searchQuery}&${param}&per_page=${this.perPage}&page=${this.page}`;

    const { data } = await axios.get(url);
    this.incrementPage();

    return data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
