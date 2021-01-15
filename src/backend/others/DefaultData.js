
var deviceselects = [];
deviceselects[0] = new Array(12).fill(true);//Select All false

var GradientArray = [
    {color:{R:255,G:0,B:0} , percent:0},
    {color:{R:255,G:128,B:0} , percent:20},
    {color:{R:128,G:255,B:0} , percent:30},
    {color:{R:0,G:255,B:0} , percent:40},
    {color:{R:0,G:255,B:255} , percent:50},
    {color:{R:0,G:0,B:255} , percent:60},
    {color:{R:128,G:0,B:255} , percent:70},
    {color:{R:255,G:0,B:255} , percent:80},
    {color:{R:255,G:0,B:128} , percent:100},
];

var SyncEffect =
{
    Blend_mode: "overlap",
    EffectLibrary:[ { 
        input_visible:true,
        Effect:0,
        Name: 'LinearWave',
        Angle: 90,
        BandWidth: 50,
        Bidirectional: false,
        Bump: 3,
        Direction: false,
        Fire: 0.1,
        Fixed: false,
        Gap: 250,
        Gradient: true,
        Number: 5,
        Opacity: 0.5,
        Randomspeed: 0,
        Separate: false,
        Soft: true,
        Radius: 250,
        Speed: 5,
        canvasCenterX: 0,
        canvasCenterY: 0,
        GradientArray:GradientArray,
        deviceselects:deviceselects
    }],
    DeviceAxis:[{X: 0, Y: 0}]
};



exports.SyncEffect = SyncEffect;