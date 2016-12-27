using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Uber_Prediction
{
    class DbServices
    {
        protected static IMongoClient _client = new MongoClient();
        protected static IMongoDatabase _database = _client.GetDatabase("UberDataDb");
        //_client = new MongoClient("mongodb://uber:0Ms26ykeb6O4LsAjuo7pNyGFa273bttyg1kdwcIzZxpfwBJrftON372VFlyDfSsVsbaO4kbjaBawjKWaqukDUQ==@uber.documents.azure.com:10250/?ssl=true");
        public static void addData(string data, LatLong start, LatLong end, string distance)
        {
            if (data != null)
            {
                BsonDocument document = BsonSerializer.Deserialize<BsonDocument>(data);
                BsonArray prices = document.GetElement(0).Value.AsBsonArray;
                BsonDocument uberData = prices[0].AsBsonDocument;
                double Average = (Double.Parse(uberData["high_estimate"].ToString()) + Double.Parse(uberData["low_estimate"].ToString())) / 2;
                BsonElement averagePrice = new BsonElement("average", BsonValue.Create(Average.ToString()));
                uberData.Add(averagePrice);
                BsonElement currentDate = new BsonElement("date", BsonValue.Create(DateTime.Now.ToLongDateString()));
                uberData.Add(currentDate);
                BsonElement currentTime = new BsonElement("time", BsonValue.Create(DateTime.Now.ToLongTimeString()));
                uberData.Add(currentTime);
                BsonElement startLatLong = new BsonElement("start_coordinates", BsonValue.Create(start.Latitude + ", " + start.Longitude));
                uberData.Add(startLatLong);
                BsonElement endLatLong = new BsonElement("end_coordinates", BsonValue.Create(end.Latitude + ", " + end.Longitude));
                uberData.Add(endLatLong);
                BsonElement distanceb = new BsonElement("distance_required", BsonValue.Create(distance));
                uberData.Add(distanceb);
                var collection = _database.GetCollection<BsonDocument>("uberData");
                collection.InsertOne(uberData);
            }
            else {
                Console.WriteLine("Uber Price Data is Null");
            }
        }
    }
}
