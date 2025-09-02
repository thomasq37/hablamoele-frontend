// Dictionnaire de traductions pour les messages de formulaire
const formTranslations = {
    es: {
        success: '¡Mensaje enviado con éxito!',
        error: 'Ocurrió un error.',
    },
    fr: {
        success: 'Message envoyé avec succès!',
        error: 'Une erreur est survenue.',
    },
    en: {
        success: 'Message sent successfully!',
        error: 'An error occurred.',
    },
    uk: {
        success: 'Повідомлення успішно надіслано!',
        error: 'Виникла помилка.',
    },
    ru: {
        success: 'Сообщение успешно отправлено!',
        error: 'Произошла ошибка.',
    },
    // Ajoutez d'autres langues ici
};

// Écouter l'envoi du formulaire de contact
document.getElementById('formcontact').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch('/submit-contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            const storedLanguage = localStorage.getItem("language") || 'es'; // Récupérer la langue stockée
            if (result.success) {
                alert(formTranslations[storedLanguage].success);
                this.reset(); // Réinitialise le formulaire
            } else {
                alert(result.message || formTranslations[storedLanguage].error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const storedLanguage = localStorage.getItem("language") || 'es'; // Récupérer la langue stockée
            alert(formTranslations[storedLanguage].error);
        });
});
