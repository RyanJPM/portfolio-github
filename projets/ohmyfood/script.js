// Ici vous pourrez rajouter l'evenement de votre modal








// Pop-up :

// === POPUP CONCOURS ===
document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popup-concours");
    const closeBtn = document.querySelector(".popup-close");
    const form = document.getElementById("popup-form");
    if (!popup || !closeBtn || !form) return;
  
    // Affiche le popup au bout de 3 secondes
    setTimeout(() => {
      popup.style.display = "flex";
    }, 3000);
  
    // Ferme le popup
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  
    // Empêche le submit de recharger la page
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Merci pour votre participation !");
      popup.style.display = "none";
    });
  });
  









// === HAMBURGER MENU ===


document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger-toggle");
  const nav = document.querySelector(".main-navigation");
  if (!hamburger || !nav) return;

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("open");
    nav.classList.toggle("active");
  });
});




























// Script pour la page Restaurant

// Gestion des formulaires et modals pour la page Restaurant

// jQuery(document).ready(function($) {
//     // Gestion des sélecteurs personnalisés (date et heure)
//     $('.custom-select input[readonly]').on('click', function() {
//         const inputType = $(this).attr('placeholder');
        
//         if (inputType === 'Date') {
//             // Créer un input date temporaire et le cliquer
//             const dateInput = $('<input type="date">');
//             dateInput.css('position', 'absolute').css('left', '-9999px');
//             $('body').append(dateInput);
            
//             dateInput.on('change', function() {
//                 const selectedDate = $(this).val();
//                 $('.custom-select input[placeholder="Date"]').val(selectedDate);
//                 $(this).remove();
//             });
            
//             dateInput.click();
//         } else if (inputType === 'Heure') {
//             // Créer un input time temporaire et le cliquer
//             const timeInput = $('<input type="time">');
//             timeInput.css('position', 'absolute').css('left', '-9999px');
//             $('body').append(timeInput);
            
//             timeInput.on('change', function() {
//                 const selectedTime = $(this).val();
//                 $('.custom-select input[placeholder="Heure"]').val(selectedTime);
//                 $(this).remove();
//             });
            
//             timeInput.click();
//         }
//     });
    
//     // Rendre la sélection de ville modifiable
//     $('.custom-select input[value="Paris (Default)"]').prop('readonly', false);
    
//     // Gestion du bouton de réservation
//     $('.btn-reserve').on('click', function(e) {
//         e.preventDefault();
        
//         // Afficher la section des options de réservation
//         $('.reservation-options').css('display', 'block');
        
//         // Faire défiler jusqu'à la section des options de réservation
//         $('html, body').animate({
//             scrollTop: $('.reservation-options').offset().top - 100
//         }, 500);
//     });
    
//     // Fonctionnalité pour fermer la modale des options de réservation
//     // Ajouter un bouton de fermeture à la modale
//     if ($('.reservation-options .close-modal').length === 0) {
//         $('.reservation-options').prepend('<button class="close-modal">&times;</button>');
        
//         // Styles pour le bouton de fermeture
//         $('.close-modal').css({
//             'position': 'absolute',
//             'top': '20px',
//             'right': '20px',
//             'background': 'none',
//             'border': 'none',
//             'font-size': '24px',
//             'cursor': 'pointer',
//             'color': '#333'
//         });
//     }
    
//     // Gérer le clic sur le bouton de fermeture
//     $(document).on('click', '.close-modal', function() {
//         $('.reservation-options').css('display', 'none');
//     });
    
//     // Gestion des boutons dans les options de réservation
//     $('.btn-create-account, .btn-login').on('click', function() {
//         const action = $(this).hasClass('btn-create-account') ? 'créer un compte' : 'se connecter';
//         alert('Vous allez ' + action + '. Cette fonctionnalité sera bientôt disponible.');
//         // Ici vous pourriez rediriger vers les pages appropriées
//     });
    
//     // Recherche de ville dans la barre principale
//     $('.search-box form').on('submit', function(e) {
//         e.preventDefault();
//         const city = $(this).find('input[name="city"]').val();
        
//         if (city.trim() !== '') {
//             alert('Recherche de restaurants à ' + city + '. Cette fonctionnalité sera bientôt disponible.');
//             // Dans une implémentation réelle, vous feriez une requête AJAX ici
//         } else {
//             alert('Veuillez entrer un nom de ville.');
//         }
//     });
// });