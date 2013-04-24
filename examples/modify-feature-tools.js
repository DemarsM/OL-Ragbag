// Alter default OpenLayers options
// --------------------------------

// Allow testing of specific renderers via "?renderer=Canvas", etc
var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
OpenLayers.Layer.Vector.prototype.renderers = renderer ?
                                    [renderer] :
                                    OpenLayers.Layer.Vector.prototype.renderers;

OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '3';

// Create Objects
// --------------

// To report draw modify and delete events
var reportEvent;
if (console && console.log) {
    reportEvent = function(event) {
    return;
        console.log(event.type,
                    event.feature ? event.feature.id : event.components);
    };
} else {
    reportEvent = function() {};
}

// Create the vectorial layer
var vectorLayer = new OpenLayers.Layer.Vector('Vector Layer');
vectorLayer.events.on({
    'beforefeaturemodified': reportEvent,
    'featuremodified': function(e) {
        e.feature.state = OpenLayers.State.UPDATE;
        reportEvent(e);
    },
    'afterfeaturemodified': reportEvent,
    'beforefeatureremoved': reportEvent,
    'featureremoved': reportEvent,
    'vertexmodified': reportEvent,
    'sketchmodified': reportEvent,
    'sketchstarted': reportEvent,
    'sketchcomplete': reportEvent
});

// Create and show the map
var map = new OpenLayers.Map({
    div: 'map',
    layers: [
        new OpenLayers.Layer.WMS('osgeo WMS',
                  'http://vmap0.tiles.osgeo.org/wms/vmap0?', {layers: 'basic'}),
        vectorLayer
    ]
});
map.setCenter(new OpenLayers.LonLat(0, 0), 3);

// Create the control collection to draw vectorial features.
var controls = {
    point: new OpenLayers.Control.DrawFeature(vectorLayer,
                OpenLayers.Handler.Point),
    line: new OpenLayers.Control.DrawFeature(vectorLayer,
                OpenLayers.Handler.Path),
    polygon: new OpenLayers.Control.DrawFeature(vectorLayer,
                OpenLayers.Handler.Polygon),
    modify: new OpenLayers.Control.ModifyFeature(vectorLayer, {
        deferDelete: true,
        eventListeners: {
            'beforefeaturedeleted': reportEvent,
            'featuredeleted': reportEvent
        }
    })
};
// add this controls to the map
for (var key in controls) {
    map.addControl(controls[key]);
}

// Functions called from the form fields to choose the desired control to test.
// ----------------------------------------------------------------------------

// Function to toggle the active control
function toggleControl(element) {
    for (key in controls) {
        var control = controls[key];
        if (element.value === key && element.checked) {
            control.activate();
        } else {
            control.deactivate();
        }
    }
}

// Functions to change the behavior of modify control
function updateModifyControl() {
    var vertices = document.getElementById('vertices').checked;
    var rotate = document.getElementById('rotate').checked;
    var resize = document.getElementById('resize').checked;
    var drag = document.getElementById('drag').checked;
    var deform = document.getElementById('deform').checked;
    var delete_ = document.getElementById('delete').checked;

    controls.modify.createVertices =
                        document.getElementById('createVertices').checked;
    // reset modification mode
    controls.modify.mode = 0;
    if (vertices) {
        controls.modify.mode |= OpenLayers.Control.ModifyFeature.VERTICES;
    }
    if (rotate) {
        controls.modify.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
    }
    if (resize) {
        controls.modify.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
    }
    if (deform) {
        controls.modify.mode |= OpenLayers.Control.ModifyFeature.DEFORM;
    }
    if (drag) {
        controls.modify.mode |= OpenLayers.Control.ModifyFeature.DRAG;
    }
    if (delete_) {
        controls.modify.mode |= OpenLayers.Control.ModifyFeature.DELETE;
    }
}


