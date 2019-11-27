(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 500, "easeInOutCubic");
        return false;
      }
    }
  });

})(jQuery); // End of use strict

document.querySelector("#more-projects-btn").addEventListener("click", function(e) {
  document.querySelector("#more-projects").classList.toggle("my-hidden")
  console.log(e.target.innerHTML)
  if (e.target.innerHTML == "See More") {
    e.target.innerHTML = "See Less"
    return
  }
  setTimeout(function() {
    e.target.innerHTML = "See More"
    document.querySelector('#about').scrollIntoView({ 
    behavior: 'smooth' 
    });
  },500);
})
