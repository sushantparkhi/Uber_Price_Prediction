using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Uber_Prediction
{
    class UberServices
    {
        private static string API_Call(string URL, string urlParameters)
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(URL + urlParameters);
            client.DefaultRequestHeaders.Add("Authorization", "Token iot6tHkOuq9X4ruQVOiJ36LvFw6jFUiTNapg2mm6");
            client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = client.GetAsync(client.BaseAddress).Result;  // Blocking call!
            if (response.IsSuccessStatusCode)
            {
                var dataObjects = response.Content.ReadAsStringAsync().Result;
                //Console.WriteLine(dataObjects);
                return dataObjects;
            }
            else
            {
                Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                return null;
            }
        }

        public static string getPrice(LatLong start, LatLong end)
        {
            if (start != null && end != null)
            {
                string URL = "https://api.uber.com/v1";
                string urlParameters = "/estimates/price?" +
                            "start_latitude=" + start.Latitude +
                            "&start_longitude=" + start.Longitude +
                            "&end_latitude=" + end.Latitude +
                            "&end_longitude=" + end.Longitude;
                string data = API_Call(URL, urlParameters);
                return data;
            }
            else
            {
                return null;
            }

        }
    }
}
