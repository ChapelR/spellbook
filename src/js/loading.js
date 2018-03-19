// loading

var $loader = $(document.createElement('div'))
    .attr('id', 'loader')
    .append(Story.get('Loader').text)
    .appendTo('#story')
    .hide();

function showLoader (time) {
    $loader.fadeIn(time);
}

function hideLoader (time) {
    $loader.fadeOut(time);
}

setup.loading = {
    $el : $loader,
    show : showLoader,
    dismiss : hideLoader
};

$(document).on('click', 'load-list', setup.loading.show);