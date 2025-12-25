const photos = document.querySelectorAll('.gallery-grid img');

photos.forEach(photo => {
  photo.addEventListener('click', () => {
    alert('Красивое фото!');
  });
});

