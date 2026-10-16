const filterButtons = document.querySelectorAll(".filter-button");
const galleryImages = document.querySelectorAll(".gallery img");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedFilter = button.dataset.filter;

        filterButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        galleryImages.forEach((image) => {
            const imageCategory = image.dataset.category;

            if (
                selectedFilter === "all" ||
                selectedFilter === imageCategory
            ) {
                image.classList.remove("hidden");
            } else {
                image.classList.add("hidden");
            }
        });
    });
});
