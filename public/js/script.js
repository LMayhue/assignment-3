//Make a popup that comes up anytime somebody `submits` a form
    //Mainly want this for deleting a recipe
const confirmForms = document.querySelectorAll('form[data-confirm]');

//Add a 'submit' event listener to each form on the page (generally only 1)
confirmForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
        const question = form.dataset.confirm;
        const confirmed = window.confirm(question);

        //If the user doesn't confirm, don't do the action
        if (!confirmed) {
            event.preventDefault();
        }
    });
});
