'use strict';

$('#selectVisu').on("click", function() {
  $('#presentation').hide();
  $('#visual').removeClass('hidden');
});


$('#backToPresentation').on("click", function() {
  $('#presentation').show();
  $('#visual').addClass('hidden');
});
