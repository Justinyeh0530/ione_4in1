using System;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using LED_Control;
using System.Threading;
using System.Drawing;

namespace A08sdll
{
    public class Class1
    {
        public class ColorData
        {
            public int Bright { get; set; }
            public int Speed { get; set; }
            public int ColorMode { get; set; }
            public int SetColorMode { get; set; }
            public int RadarDuration { get; set; }
            public int [] Color1 { get; set; }
            public int[] Color2 { get; set; }
            public byte[] ColorArray { get; set; }
        }
        public async Task<object> ModeSet(dynamic input)
        {
            A08s_USB Device = new A08s_USB();
            bool Mode = false, result = false, AppConnectResult = false, CloseDeviceResult = false; ;
            Mode = Device.OpenDevice(0x195D, 0xA005);
            Thread.Sleep(500);
            Device.AppConnectSend(true);
            Thread.Sleep(500);
            //CloseDeviceResult = Device.CloseDevice();
            result = Device.ModeSet(input);
            Thread.Sleep(500);
            //Device.ControlMode(1);
            //string json = Newtonsoft.Json.JsonConvert.SerializeObject(input);
            return $"Input:{input} Open Device:{Mode} ModeSet:{result} CloseDevice:{CloseDeviceResult}";
            //return await Task.Run(() => { })
        }

        public async Task<object> ControlMode(dynamic input)
        {
            string json = Newtonsoft.Json.JsonConvert.SerializeObject(input);
            ColorData colordata = JsonConvert.DeserializeObject<ColorData>(json);
            A08s_USB Device = new A08s_USB();
            bool Mode = false;
            Mode = Device.OpenDevice(0x195D, 0xA005);
            Thread.Sleep(500);
            Device.Bright = colordata.Bright;
            Device.Speed = colordata.Speed;

            //static
            if (colordata.SetColorMode == 1)
            {
                Device.StaticColorMode = colordata.ColorMode;
                //Single
                if (colordata.ColorMode == 0)
                {
                    Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    Color color2 = new Color();
                    color2 = Color.FromArgb(colordata.Color2[0], colordata.Color2[1], colordata.Color2[2]);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, color1, color2);
                }
                //Spectrum
                else if (colordata.ColorMode == 1)
                {
                    Device.ControlMode(colordata.SetColorMode);
                }
            }
            //Breathing
            else if (colordata.SetColorMode == 2)
            {
                Device.BreathingColorMode = colordata.ColorMode;
                //Single
                if (colordata.ColorMode == 0)
                {
                    Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, color1, color1);
                }
                //Spectrum
                else if (colordata.ColorMode == 1)
                {
                    Device.ControlMode(colordata.SetColorMode);
                }
                //Altemation
                else if (colordata.ColorMode == 2)
                {
                    /*Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1R, colordata.Color1G, colordata.Color1B);
                    Color color2 = new Color();
                    color2 = Color.FromArgb(colordata.Color2R, colordata.Color2G, colordata.Color2B);*/
                    Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    Color color2 = new Color();
                    color2 = Color.FromArgb(colordata.Color2[0], colordata.Color2[1], colordata.Color2[2]);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, color1, color2);
                }
            }
            else if (colordata.SetColorMode == 3)
            {
                Device.FlashColorMode = colordata.ColorMode;
                //Single
                if (colordata.ColorMode == 0)
                {
                    Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, color1, color1);
                }
                //Spectrum
                else if (colordata.ColorMode == 1)
                {
                    Device.ControlMode(colordata.SetColorMode);
                }
                //Altemation
                else if (colordata.ColorMode == 2)
                {
                    Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    Color color2 = new Color();
                    color2 = Color.FromArgb(colordata.Color2[0], colordata.Color2[1], colordata.Color2[2]);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, color1, color2);
                }
            }
            //Sprial rainbow
            else if (colordata.SetColorMode == 4)
            {
                Device.ColorSpiralRainBow1 = Color.Empty;
                Device.ColorSpiralRainBow2 = Color.Empty;
                //Single
                if (colordata.ColorMode == 1 || colordata.ColorMode == 2)
                {
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, Color.Empty, Color.Empty);
                }
                //Spectrum
                else if (colordata.ColorMode == 3 || colordata.ColorMode == 4)
                {
                    Color color1 = new Color();
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    Color color2 = new Color();
                    color2 = Color.FromArgb(colordata.Color2[0], colordata.Color2[1], colordata.Color2[2]);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, color1, color2);
                }

            }
            //Wave
            else if (colordata.SetColorMode == 5)
            {
                if(colordata.ColorMode == 0)
                {
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, Color.Empty, Color.Empty);
                }
                else
                {
                    byte[] specturmColor1;
                    specturmColor1 = colordata.ColorArray;
                    Device.PatternSet(specturmColor1, true);
                    Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, Color.Empty, Color.Empty);
                }
            }
            //ColorShift
            else if (colordata.SetColorMode == 6)
            {
                Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, Color.Empty, Color.Empty);
            }
            //Radar
            else if (colordata.SetColorMode == 7)
            {
                Color color1 = new Color();
                Color color2 = new Color();

                Device.ColorRadar1 = Color.Empty;
                Device.ColorRadar2 = Color.Empty;

                if (colordata.ColorMode == 1)
                {
                    color1 = color2 = Color.Empty;
                }
                //Altemation
                else if (colordata.ColorMode == 2)
                {
                    color1 = Color.FromArgb(colordata.Color1[0], colordata.Color1[1], colordata.Color1[2]);
                    color2 = Color.FromArgb(colordata.Color2[0], colordata.Color2[1], colordata.Color2[2]);
                }

                Device.ControlMode(colordata.SetColorMode, colordata.ColorMode, colordata.Bright, colordata.Speed, colordata.RadarDuration, color1, color2);
            }
            //Led Off
            else if (colordata.SetColorMode == 8)
            {
                Device.ControlMode(8);
            }

                return $"Success";
        }

        public async Task<object> init(dynamic input)
        {
            A08s_USB Device = new A08s_USB();
            bool result = Device.OpenDevice(0x195d, 0xa005);
            return result;
        }
    }
}
