(function($) {
  "use strict"; // Start of use strict

  $(document).keyup(function(e) {
       if (e.key === "Escape" &&  document.querySelector('#project-nav a') != null) {
        window.location = document.querySelector('#project-nav a') 
      }
  });

})(jQuery); // End of use strict