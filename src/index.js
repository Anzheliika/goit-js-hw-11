import './css/style.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import PicturesApiService from './js/PictureApiServer.js';
import LoadMoreBtn from './js/components/load-more-btn';
import { Notify } from 'notiflix';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

const picturesApiService = new PicturesApiService();

refs.form.addEventListener('submit', onSearch);
loadMoreBtn.button.addEventListener('click', fetchPictures);

function onSearch(event) {
  event.preventDefault();

  const form = event.currentTarget;
  picturesApiService.query = form.elements.searchQuery.value;

  if (!picturesApiService.query) {
    Notify.failure('Please, enter your request.');
    return;
  }
  showQuantity();
  loadMoreBtn.show();
  picturesApiService.resetPage();
  clearGallery();
  fetchPictures().finally(() => form.reset());
}

async function fetchPictures() {
  loadMoreBtn.disable();

  try {
    const markup = await getPicturesMarkup();
    appendPicturesList(markup);
    loadMoreBtn.enable();

    const data = await picturesApiService.fetchPictures();

    const pages = Math.ceil(data.totalHits / picturesApiService.perPage);
    if (data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.hide();
    } else if (picturesApiService.page > pages) {
      Notify.info(`We're sorry, but you've reached the end of search results.`);
    }

    const lightbox = new SimpleLightbox('.gallery a', {
      captionDelay: 250,
    });

    lightbox.refresh();
  } catch (error) {
    onError;
  }
}

async function getPicturesMarkup() {
  try {
    const data = await picturesApiService.fetchPictures();
    return data.hits.reduce(
      (markup, picture) => markup + createPicturesList(picture),
      ''
    );
  } catch (error) {
    onError(error);
  }
}

async function showQuantity() {
  const data = await picturesApiService.fetchPictures();
  if (picturesApiService.page - 1 === 1 && data.hits.length > 1) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
}

function createPicturesList({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
          <div class="photo-card">
    <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
    <div class="info">
      <p class="info-item">
        <b class="info-desc">Likes: </b><span class="info-value">${likes}</span>
      </p>
      <p class="info-item">
        <b class="info-desc">Views: </b><span class="info-value">${views}</span>
      </p>
      <p class="info-item">
        <b class="info-desc">Comments: </b><span class="info-value">${comments}</span>
      </p>
      <p class="info-item">
        <b class="info-desc">Downloads: </b><span class="info-value">${downloads}</span>
      </p>
    </div>
  </div>`;
}

function appendPicturesList(markup) {
  if (markup !== undefined) {
    refs.gallery.insertAdjacentHTML('beforeend', markup);
  }
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function onError(err) {
  clearGallery();
  loadMoreBtn.hide();
}
