using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Uber_Prediction
{
    class LatLong
    {
        private double Lat;
        private double Long;
        public LatLong(double Lat, double Long)
        {
            this.Lat = Lat;
            this.Long = Long;
        }
        public double Latitude
        {
            get
            {
                return Lat;
            }
        }
        public double Longitude
        {
            get
            {
                return Long;
            }
        }
    }
}
