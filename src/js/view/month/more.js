/**
 * @fileoverview Floating layer for displaying schedule in specific date
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var OUT_PADDING = 5;
var util = global.tui.util;
var config = require('../../config'),
    domevent = require('../../common/domevent'),
    domutil = require('../../common/domutil'),
    View = require('../../view/view'),
    FloatingLayer = require('../../common/floatingLayer'),
    tmpl = require('./more.hbs');

/**
 * @constructor
 * @extends {View}
 * @param {HTMLElement} container = container element
 */
function More(container) {
    View.call(this, container);

    /**
     * @type {FloatingLayer}
     */
    this.layer = new FloatingLayer(null, container);

    domevent.on(container, 'click', this._onClick, this);
}

util.inherit(More, View);

/**
 * Click event handler for close button
 * @param {MouseEvent} clickEvent - mouse event object
 */
More.prototype._onClick = function(clickEvent) {
    var target = (clickEvent.target || clickEvent.srcElement);
    var className = config.classname('month-more-close');

    if (!domutil.hasClass(target, className) && !domutil.closest(target, '.' + className)) {
        return;
    }

    this.hide();
};

/**
 * Mousedown event handler for hiding more layer when user mousedown outside of
 * layer
 * @param {MouseEvent} mouseDownEvent - mouse event object
 */
More.prototype._onMouseDown = function(mouseDownEvent) {
    var target = (mouseDownEvent.target || mouseDownEvent.srcElement),
        moreLayer = domutil.closest(target, config.classname('.month-more'));

    if (moreLayer) {
        return;
    }

    this.hide();
};

/**
 * Get new position for more layer by +n element itself
 * @param {HTMLElement} target - +n element
 * @param {HTMLElement} weekItem - weekItem container element
 * @returns {number[]} new position of more layer
 */
More.prototype._getRenderPosition = function(target, weekItem) {
    var pos = domevent.getMousePosition({
        clientX: domutil.getPosition(target)[0],
        clientY: domutil.getPosition(weekItem)[1]
    }, this.container);

    return [pos[0] - OUT_PADDING, pos[1] - OUT_PADDING];
};

/**
 * @override
 */
More.prototype.destroy = function() {
    this.layer.destroy();
    this.layer = null;
    domevent.off(this.container, 'click', this._onClick, this);
    domevent.off(document.body, 'mousedown', this._onMouseDown, this);
    View.prototype.destroy.call(this);
};

/**
 * @override
 * @param {object} viewModel - view model from factory/monthView
 */
More.prototype.render = function(viewModel) {
    var target = viewModel.target;
    var weekItem = domutil.closest(target, config.classname('.month-week-item'));
    var layer = this.layer;
    var self = this;
    var pos = this._getRenderPosition(target, weekItem);
    var height = domutil.getSize(weekItem)[1] + (OUT_PADDING * 2);
    var width = viewModel.width + (OUT_PADDING * 2);

    layer.setContent(tmpl(viewModel));
    if (weekItem.parentElement.lastElementChild === weekItem) {
        layer.setLTRB({
            left: pos[0],
            bottom: 0
        });
        layer.setSize(width, '');
    } else {
        layer.setPosition(pos[0], pos[1]);
        layer.setSize(width, height);
    }
    
    layer.show();

    util.debounce(function() {
        domevent.on(document.body, 'mousedown', self._onMouseDown, self);
    })();
};

/**
 * Hide layer
 */
More.prototype.hide = function() {
    this.layer.hide();
    domevent.off(document.body, 'mousedown', this._onMouseDown, this);
};

module.exports = More;