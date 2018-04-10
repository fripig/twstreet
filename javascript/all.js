var
    $userimage = $('#userimage .inner'),
    $coverimage = $('#coverimage .inner'),
    $dragger = $('#dragger'),
    $sizer = $('#size-slider'),
    $loading = $('#loading'),
    $uploading = $('#uploading');

$(window).load(function () {
    var
        container_size = $userimage.width(),
        userimage_size = getImgSize(getBackgroundImage($userimage));
    resizeDragger(userimage_size, container_size);
});
$(document).ready(function () {
    // ie alert
    $("body").iealert({
        support: 'ie9',
        title: '您的瀏覽器太舊啦！',
        text: '請更新您的瀏覽器，我們推薦您使用 Google Chrome',
        closeBtn: false,
        upgradeTitle: '下載 Google Chrome',
        upgradeLink: 'http://www.google.com/chrome/'
    });
    $('body').keydown(function (e) {
            switch (event.keyCode) {
                case 37:
                    break;
                case 39:
                    break;
            }
        }
    )

    // dragger
    $dragger.draggable({
        drag: function (event) {
            $userimage.css('background-position', $dragger.css('left') + ' ' + $dragger.css('top'));
            if ($userimage.hasClass('dragged') == false) $userimage.addClass('dragged');
            var value = $('input[name=template]:checked').val();
            if (value == 9 || value == 10) $userimage.attr('class', 'inner');
        }
    });

    // size slider
    $sizer.slider({
        value: 100,
        max: 170,
        min: 30,
        slide: function (event, ui) {
            var
                truesize = getBackgroundSize($userimage.css('background-size')),
                position = getBackgroundPosition($userimage.css('background-position')),
                center = getBackgroundCenterPoint(truesize, position);
            $('<img/>').attr('src', getBackgroundImage($userimage))
                .load(function () {
                    var
                        size = [this.width, this.height],
                        width = size[0] * (ui.value) / 100,
                        height = size[1] * (ui.value) / 100,
                        left = center[0] - width * 0.5,
                        top = center[1] - height * 0.5;
                    $dragger
                        .css('width', width + 'px').css('height', height + 'px')
                        .css('top', top + 'px').css('left', left + 'px');
                    $userimage
                        .css('background-size', width + 'px ' + height + 'px')
                        .css('background-position', left + 'px ' + top + 'px');
                });

        }
    });

    // change template
    $('body').delegate('input[name=template]', 'change', function () {
        var
            width,
            value = $(this).val(),
            url = 'images/object/' + value + '.png';

        $coverimage.css('background-image', 'url(' + url + ')');
        if ($userimage.hasClass('dragged') == true) $userimage.attr('class', 'inner dragged');
        else $userimage.attr('class', 'inner');

        $('<img/>').attr('src', getBackgroundImage($userimage))
            .load(function () {
                var
                    size = [this.width, this.height],
                    container_size = $userimage.width();
                resizeDragger(size, container_size, value);
            });
    });

    $("#normalSubmit").click(function () {
        var
            basesize = $userimage.width(),
            size = getBackgroundSize($userimage.css('background-size')),
            position = getBackgroundPosition($userimage.css('background-position')),
            scale = basesize / 500;

        var
            template = $('input[name=template]:checked').val(),
            source = $('#source').val(),
            w = size[0] / scale,
            h = size[1] / scale,
            x = position[0] / scale,
            y = position[1] / scale;
        createImage(template, source, x, y, w, h);
    });
});
// $(window).konami({
//   code : [55,55,55],
//   cheat: function() {
//     $('.banana').slideDown();
//   }
// });
// $(window).konami({
//   code : [54,54,54],
//   cheat: function() {
//     $('h1,#size-slider').delay(100).animate({'opacity':'0'},2900)
//     $('#formbuttons,.template-label').delay(400).animate({'opacity':'0'},2600)
//     $('#settings').delay(1000).animate({'opacity':'0'},2000)
//     $('.left-bottom-corner').delay(800).animate({'opacity':'0'},2200)
//     $('.preview').animate({'top':'-500px','opacity':'0.5'},3000).animate({'width':'0','opacity':'0'},3000,function(){
//       $('#content').slideUp();
//     })
//   }
// });

function createImage(template, source, x, y, w, h) {
    var cover = new Image();
    cover.src = 'images/object/' + template + '.png';

    var userimage = new Image();
    userimage.src = source;

    var resize_canvas = document.getElementById("result");
    resize_canvas.width = 500;
    resize_canvas.height = 500;

    var ctx = resize_canvas.getContext("2d");
    ctx.rect(0, 0, 500, 500);
    ctx.fillStyle = "#CCCCCC";
    ctx.fill();
    ctx.drawImage(userimage, x, y, w, h);
    ctx.drawImage(cover, 0, 0, 500, 500);

    var base64 = resize_canvas.toDataURL("image/png");

    // check ie or not
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        var html = "<p>請按右鍵另存圖片</p>";
        html += "<img src='" + base64 + "' alt='10'/>";
        var tab = window.open();
        tab.document.write(html);
    }
    else {
        $('#download').attr('href', base64);
        $('#download').attr('download', (+new Date()) + '.png');
        $('#download')[0].click();
    }
}

//uploader
$(function () {
    var dropZone = document.getElementById('drop');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    $('.uploadBtn').click(function () {
        $('#uploadInput').click();
    });
    $('#uploadInput').on('change', function () {
        input = document.getElementById('uploadInput');
        loadImage(input.files);
    });
});

// drag image
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    loadImage(files);
}
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

// function
function loadImage(files) {
    var file, fr, img;
    if (!files) {
        alert('悲劇！您的瀏覽器不支援檔案上傳！')
    } else {
        $uploading.fadeIn();
        $loading.show();
        file = files[0];
        fr = new FileReader();
        fr.onload = createImage;
        fr.readAsDataURL(file);
    }
    function createImage() {
        img = new Image();
        img.onload = imageLoaded;
        img.src = fr.result;
    }

    function imageLoaded() {
        var canvas = document.getElementById("canvas")
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var base64 = canvas.toDataURL("image/png");

        $('#source').attr('value', base64);
        $userimage.css('background-image', 'url(' + base64 + ')');

        var thumb = document.getElementById("thumb");
        var thumb_w, thumb_h;
        if (img.width > img.height) {
            thumb_h = 100;
            thumb_w = 100 * (img.width / img.height);
        }
        else {
            thumb_w = 100;
            thumb_h = 100 * (img.height / img.width);
        }
        thumb.width = thumb_w;
        thumb.height = thumb_h;
        var ctx = thumb.getContext("2d");
        ctx.drawImage(img, 0, 0, thumb_w, thumb_h);
        var thumbbase64 = thumb.toDataURL("image/png");
        $('#templates label').css('background-image', 'url(' + thumbbase64 + ')');

        $('<img/>').attr('src', base64)
            .load(function () {
                var
                    value = $('input[name=template]:checked').val(),
                    container_size = $userimage.width(),
                    userimage_size = [this.width, this.height];
                resizeDragger(userimage_size, container_size, value);

                $loading.hide();
                $uploading.fadeOut();
            });
    }
}
function getImgSize(src) {
    var newImg = new Image();
    newImg.src = src;
    return [newImg.width, newImg.height];
}
function getBackgroundImage(element) {
    var url = element.css('background-image');
    return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}
function resizeDragger(size, wrapper, value, upload) {
    value = typeof value !== 'undefined' ? value : 1;
    upload = typeof upload !== 'undefined' ? upload : 0;

    var scale, width, height, top, left;
    if (size[0] > size[1]) {
        scale = (wrapper / size[1]);
        width = size[0] * scale;
        height = wrapper;
        top = 0;
        left = (width - wrapper) * 0.5 * -1;
    }
    else {
        scale = (wrapper / size[0]);
        width = wrapper;
        height = size[1] * scale;
        top = (height - wrapper) * 0.5 * -1;
        left = 0;
    }

    if (value == 6) {
        left = wrapper * 0.2 * -1;
        if (size[0] > size[1]) left -= (width - wrapper) * 0.5;
    }
    else if (value == 9) {
        $sizer.slider('value', 65);
        if (size[0] > size[1]) {
            left = wrapper * 0.65 * 0.13 * 0.5;
            width *= 0.65;
            height *= 0.65;
            top = (wrapper - height) * 0.48;
        }
        else {
            left = wrapper * 0.65 * 0.13 * 0.5;
            width *= 0.65;
            height *= 0.65;
            top = (wrapper - height) * 0.48;
        }
    }
    else if (value == 10) {
        $sizer.slider('value', 92);
        if (size[0] > size[1]) {
            width = wrapper * 0.92;
            height = width * (size[1] / size[0]);
            top = wrapper * 0.045;
            left = (wrapper - width) * 0.5;
        }
        else {
            width = width * 0.92;
            height = height * 0.92;
            top = wrapper * 0.045;
            left = (wrapper - width) * 0.5;
        }
    }

    $dragger
        .css('width', width + 'px').css('height', height + 'px')
        .css('top', top + 'px').css('left', left + 'px');
    $userimage
        .css('background-size', width + 'px ' + height + 'px')
        .css('background-position', left + 'px ' + top + 'px');
}
function getBackgroundSize(string) {
    size = string.split(' ');
    return [px2int(size[0]), px2int(size[1])];
}
function getBackgroundPosition(string) {
    position = string.split(' ');
    return [px2int(position[0]), px2int(position[1])];
}
function getBackgroundCenterPoint(size, position) {
    return [size[0] * 0.5 + position[0], size[1] * 0.5 + position[1]]
}
function px2int(string) {
    return parseFloat(string.replace('px', ''));
}
