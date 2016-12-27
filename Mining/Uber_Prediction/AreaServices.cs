using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Uber_Prediction
{
    class AreaServices
    {
        public static dynamic getArrayfromJSON(string path)
        {
            dynamic array;
            using (StreamReader r = new StreamReader(path))
            {
                string json = r.ReadToEnd();
                array = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
            }
            return array;
        }
    }
}
