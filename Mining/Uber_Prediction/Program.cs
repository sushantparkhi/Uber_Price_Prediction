using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Xml.Linq;
using System.Net;

namespace Uber_Prediction
{
    class Program
    {
        static dynamic array = AreaServices.getArrayfromJSON("Areas.json");

        public static void ScrapData(string Area)
        {
            Console.WriteLine("******Thread is Started for " + Area + "******");
            try
            {
                while (true)
                {
                    foreach (var item in Area.Equals("Boston") ? array.Boston : array.Cambridge)
                    {
                        LatLong SourceLatLong = LatLongServices.GeocodeAddress(Convert.ToString(item.Area) + " MA");
                        if (SourceLatLong != null)
                        {
                            for (double i = 3218.69; i <= 9656.06; i = i + 3218.69)
                            {
                                try
                                {
                                    LatLong EndlatLong = LatLongServices.CalculateDerivedPosition(SourceLatLong, i, 0);
                                    string Price = UberServices.getPrice(SourceLatLong, EndlatLong);
                                    DbServices.addData(Price, SourceLatLong, EndlatLong, (i / 1609.34).ToString());
                                    Console.WriteLine("====Area: " + item.Area + ", Distance: " + i + "\nStartLatLong: " + SourceLatLong.Latitude + ", " + SourceLatLong.Longitude + " EndLatLong: " + EndlatLong.Latitude + ", " + EndlatLong.Longitude + " ====");

                                    Thread.Sleep(1000);
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine(ex.Message);
                                    Console.WriteLine("%%%%%%Error Occurred in Writing Data to Mongo%%%%%%");
                                }
                            }
                        }
                    }
                    Console.WriteLine("******Thread is in Sleep Mode*******");
                    Thread.Sleep(49500);
                }
            }
            catch (Exception ex) {
                Console.WriteLine("%%%%Error Occurred in Running Thread%%%%%");
                Console.WriteLine(ex.Message);
            }
        }

        static void Main(string[] args)
        {
            Thread bostonScrap = new Thread(() => ScrapData("Boston"));
            Thread cambridgeScrap = new Thread(() => ScrapData("Cambridge"));
            bostonScrap.Start();
            cambridgeScrap.Start();
            Console.ReadKey();
        }
    }
}
