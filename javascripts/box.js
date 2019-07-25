/*
 * @Author: Antoine YANG
 * @Date: 2019-07-25 15:53:54
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-25 18:06:38
 */
var Box = /** @class */ (function () {
    function Box() {
        var _this = this;
        this.div = null;
        $('body').append('<div></div>');
        this.div = $('body div:last');
        this.div.css('background', '#4444bb44')
            .css('border', '1px solid black')
            .css('position', 'relative')
            .css('width', '180px')
            .css('height', '120px')
            .css('position', 'absolute')
            .addClass('parentbox')
            .addClass('fixed')
            .mousedown(function (event) {
            var dx = event.pageX - parseFloat($(this).css('left'));
            var dy = event.pageY - parseFloat($(this).css('top'));
            $(this).addClass('active').removeClass('fixed').attr('_dx_', dx).attr('_dy_', dy);
        })
            .mouseover(function (event) {
            var dx = event.pageX - parseFloat($(this).css('left'));
            var dy = event.pageY - parseFloat($(this).css('top'));
            if (!Box.ready || dx < 0 || dx > parseFloat($(this).css('width')) ||
                dy < 0 || dy > parseFloat($(this).css('height')))
                return;
            $(this).addClass('ready').css('background', '#4444bbaa');
        })
            .mouseout(function () {
            if ($(_this.div).hasClass('ready'))
                $(_this.div).removeClass('ready').css('background', '#4444bb44');
        })
            .dblclick(function () {
            _this.div.remove();
        });
    }
    Box.ready = false;
    return Box;
}());
$(document).ready(function () {
    $('body').append('<button></button>');
    $('body button:last').attr('type', 'button')
        .attr('class', 'btn btn-large btn-block btn-default')
        .text('cut')
        .css('width', '40px')
        .css('position', 'absolute')
        .click(function () {
        new Box();
    });
    $('body').mouseup(function () {
        if (Box.ready) {
            Box.ready = false;
            $('div.ready').append($('.cloning').clone(true));
            $('div.ready').css('width', 'auto');
            $('div.ready').css('height', 'auto');
            $('.cloning').removeClass('cloning').addClass('still');
            $('div.ready').unbind();
            $('div.ready').children().unbind();
            $('div.ready').dblclick(function () {
                $(this).remove();
            })
                .mousedown(function (event) {
                var dx = event.pageX - parseFloat($(this).css('left'));
                var dy = event.pageY - parseFloat($(this).css('top'));
                $(this).addClass('active').removeClass('fixed').attr('_dx_', dx).attr('_dy_', dy);
            })
                .mouseover(function (event) {
                var dx = event.pageX - parseFloat($(this).css('left'));
                var dy = event.pageY - parseFloat($(this).css('top'));
                if (!Box.ready || dx < 0 || dx > parseFloat($(this).css('width')) ||
                    dy < 0 || dy > parseFloat($(this).css('height')))
                    return;
                $(this).addClass('ready').css('background', '#4444bbaa');
            })
                .mouseout(function () {
                if ($(this).hasClass('ready'))
                    $(this).removeClass('ready').css('background', '#4444bb44');
            });
            $('div.ready').removeClass('ready').css('background', '#4444bb44');
        }
        $('div.active').addClass('fixed').removeClass('active');
    })
        .mousemove(function (event) {
        var x = event.pageX - parseFloat($('div.active').attr('_dx_'));
        var y = event.pageY - parseFloat($('div.active').attr('_dy_'));
        $('div.active').css('top', y + "px").css('left', x + "px");
    });
    $('.cloneable').addClass('still')
        .css('-webkit-user-select', 'none')
        .css('-moz-user-select', 'none')
        .css('-o-user-select', 'none')
        .css('user-select', 'none')
        .mousedown(function () {
        Box.ready = true;
        $(this).removeClass('still').addClass('cloning');
    });
});
